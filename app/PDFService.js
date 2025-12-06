app.factory("PDFService", function ($rootScope) {
  function convertName(name) {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  return {

    // exportPDF: async function (exam, user) {
    //   const { jsPDF } = window.jspdf;
    //   const wrapper = document.createElement('div');
    //   wrapper.innerHTML = exam;
    //   wrapper.style.width = "794px"; // chuẩn A4 theo px (96dpi)
    //   wrapper.style.padding = "0";
    //   wrapper.style.margin = "0 auto";
    //   document.body.appendChild(wrapper);

    //   await new Promise(resolve => setTimeout(resolve, 100));


    //   const canvas = await html2canvas(wrapper, {
    //     scale: 2,
    //     useCORS: true,
    //     allowTaint: false
    //   });

    //   const imgData = canvas.toDataURL("image/jpeg", 0.98);

    //   // Khởi tạo PDF
    //   const pdf = new jsPDF('p', 'mm', 'a4');

    //   const pageWidth = pdf.internal.pageSize.getWidth();
    //   const pageHeight = pdf.internal.pageSize.getHeight();
    //   const imgWidth = pageWidth;
    //   const imgHeight = canvas.height * (imgWidth / canvas.width);

    //   let position = 0;

    //   while (position < imgHeight) {
    //     pdf.addImage(
    //       imgData,
    //       'JPEG',
    //       0,
    //       -position,
    //       imgWidth,
    //       imgHeight
    //     );

    //     position += pageHeight;

    //     if (position < imgHeight) pdf.addPage();
    //   }

    //   pdf.save(`${convertName(user.fullname)}_${user.user_code}.pdf`);

    //   wrapper.remove();
    // },
    exportPDF: async function (exam, user) {
      const { jsPDF } = window.jspdf;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = exam;
      wrapper.style.width = "794px";
      wrapper.style.padding = "0";
      wrapper.style.margin = "0 auto";
      document.body.appendChild(wrapper);


      // ✅ FIX 1: gắn crossorigin + bust cache
      const images = wrapper.querySelectorAll("img");
      images.forEach(img => {
        img.crossOrigin = "anonymous";
        if (!img.src.includes("?t=")) {
          img.src = img.src + "?t=" + Date.now();
        }
      });

      // ✅ FIX 2: ĐỢI ẢNH LOAD XONG
      await Promise.all(
        [...images].map(img => {
          return new Promise(resolve => {
            if (img.complete && img.naturalWidth !== 0) return resolve();
            img.onload = img.onerror = resolve;
          });
        })
      );


      // ✅ ĐỢI DOM settle
      await new Promise(r => setTimeout(r, 300));


      // ✅ FIX 3: html2canvas cấu hình hoàn chỉnh
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 20000,
        backgroundColor: "#fff"
      });


      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * (imgWidth / canvas.width);

      let position = 0;

      while (position < imgHeight) {
        pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight);
        position += pageHeight;
        if (position < imgHeight) pdf.addPage();
      }

      pdf.save(`${convertName(user.fullname)}_${user.user_code}.pdf`);

      wrapper.remove();
    },
    exportExcel: async function (allData) {
      const ws_data = allData.map(d => ({
        "MSSV": d.user_code,
        "Họ và tên": d.fullname,
        "Lớp": d.class,
        "Điểm": d.mark
      }));

      const ws = XLSX.utils.json_to_sheet(ws_data);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Completed");

      XLSX.writeFile(wb, "Completed.xlsx");
    }



  };
});
