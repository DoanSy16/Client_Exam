app.factory("PDFService", function ($rootScope, DataService, IndexedDBService, $timeout) {
  $rootScope.data_images = {};
  try {
    if (DataService.getHomeData('data_images_base64')) {
      $rootScope.data_images = Object.values(DataService.getHomeData('data_images_base64'))
    } else {
      loadExamQuestion("data_image_base64", 4);
    }
  } catch (error) {
    console.error("Error loading images:", error);
  }

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


  async function loadExamQuestion(key, id) {
    try {
      // load data từ indexedDB
      const res = await IndexedDBService.get(key, id);
      if (res) {
        $timeout(() => {
          $rootScope.data_images = res.data;
        });

      } else {
        console.log("Không tìm thấy dữ liệu với key:", key);
      }
    } catch (err) {
      console.error(err);
    }
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

      // Tạo wrapper DOM từ HTML
      const wrapper = document.createElement('div');
      wrapper.innerHTML = exam;
      wrapper.style.width = "794px"; // chuẩn A4
      wrapper.style.padding = "0";
      wrapper.style.margin = "0 auto";
      document.body.appendChild(wrapper);

      // Thay thế src ảnh bằng Base64
      const imgs = wrapper.querySelectorAll('img[id^="img-"]'); // tất cả img id="img-{id}"
      imgs.forEach(img => {
        const imageId = img.id.replace('img-', ''); // lấy id ảnh
        const base64 = $rootScope.data_images[imageId]; // lấy Base64 từ $rootScope.data_images
        if (base64) {
          img.src = base64; // thay src thành Base64
        }
      });

      // Chờ wrapper render xong (nếu cần)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Chuyển DOM sang canvas
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      // Khởi tạo PDF
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
    }
    ,
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
