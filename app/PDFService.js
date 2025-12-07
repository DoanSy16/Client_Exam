
app.factory("PDFService", function ($rootScope, DataService, IndexedDBService, $timeout, $q) {

  // Biến lưu dữ liệu Base64, preload 1 lần duy nhất
  $rootScope.data_images = null;

  // Hàm chuẩn hóa tên file
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

  // Preload dữ liệu Base64 một lần duy nhất
  async function preloadDataImages() {
    if ($rootScope.data_images) {
      // đã preload trước đó, trả về luôn
      return $rootScope.data_images;
    }

    // 1. Thử load từ DataService
    const rawData = DataService.getHomeData('data_images_base64');
    if (rawData) {
      const images = {};
      Object.keys(rawData).forEach(k => {
        images[k] = rawData[k];
      });
      $rootScope.data_images = images;
      return images;
    }

    // 2. Nếu không có, load từ IndexedDB
    try {
      const res = await IndexedDBService.get("data_image_base64", 4);
      if (res) {
        return $q(resolve => {
          $timeout(() => {
            $rootScope.data_images = res.data;
            resolve(res.data);
          });
        });
      } else {
        console.log("Không tìm thấy dữ liệu trong IndexedDB");
        $rootScope.data_images = {};
        return {};
      }
    } catch (err) {
      console.error(err);
      $rootScope.data_images = {};
      return {};
    }
  }

  // Hàm export PDF
  async function exportPDF(exam, user) {
    console.log(exam);
    // Đảm bảo preload xong 1 lần duy nhất
    if (!$rootScope.data_images || Object.keys($rootScope.data_images).length === 0) {
      await preloadDataImages();
    }

    const { jsPDF } = window.jspdf;

    // Tạo wrapper DOM từ HTML exam
    const wrapper = document.createElement('div');
    wrapper.innerHTML = exam;
    wrapper.style.width = "794px"; // chuẩn A4
    wrapper.style.padding = "0";
    wrapper.style.margin = "0 auto";
    document.body.appendChild(wrapper);

    // Thay thế src ảnh bằng Base64
    // const imgs = wrapper.querySelectorAll('img[id^="img-"]');
    const imgs = wrapper.querySelectorAll('img[id^="img-"]');
  
    imgs.forEach(img => {
      const imageId = img.id.replace('img-', '');
      const base64 = $rootScope.data_images[imageId];
      if (base64) img.src = base64;
    });

    // console.log(wrapper.innerHTML); // debug HTML

    // Chờ wrapper render xong
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

  // Hàm export Excel
  async function exportExcel(allData) {
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

  return {
    preloadDataImages,
    exportPDF,
    exportExcel
  };
});
