app.factory("PDFService", function ($rootScope) {


  function getOptionLetter(index) {
    return String.fromCharCode(65 + index);
  }
  function convertName(name) {
    return name
      .normalize("NFD")                 // tách các dấu
      .replace(/[\u0300-\u036f]/g, "")  // loại bỏ dấu
      .replace(/\s+/g, "")              // loại bỏ khoảng trắng
      .toLowerCase();                    // chuyển thành chữ thường
  }


  function getData(exam) {
    console.log('exam: ', exam.classNameSelecte)
    return `
        <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: 2rem;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .export-button {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 1.5rem;
    }

    .btn-export {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }

    .btn-export:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    }

    .btn-export:active {
      transform: translateY(0);
    }

    .btn-export svg {
      width: 20px;
      height: 20px;
    }

    #examPdf {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .exam-header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 2.5rem 2rem;
      text-align: center;
      position: relative;
    }

    .exam-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    .exam-header h1 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .icon-book {
      width: 32px;
      height: 32px;
    }

    .exam-info {
      padding: 2rem;
      background: linear-gradient(to bottom, #f8fafc 0%, white 100%);
      border-bottom: 1px solid #e2e8f0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .info-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .info-label {
      font-weight: 600;
      color: #64748b;
      min-width: 110px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-value {
      color: #0f172a;
      font-weight: 600;
      flex: 1;
    }

    .info-value.mssv {
      font-family: 'Courier New', monospace;
    }

    .score-badge {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 0.5rem 1.25rem;
      border-radius: 2rem;
      font-weight: 700;
      font-size: 1.125rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .icon {
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }

    .questions-container {
      padding: 2rem;
    }

    .question-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      transition: all 0.3s ease;
    }

    .question-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
    }

    .question-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .question-number {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.125rem;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .question-content {
      display: flex;
      gap: 1.5rem;
      flex: 1;
    }

    .question-left {
      flex: 1;
    }

    .question-text {
      color: #0f172a;
      font-weight: 600;
      font-size: 1.125rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }

    .answers-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .answer-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
    }

    .answer-item.correct {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }

    .answer-option {
      flex-shrink: 0;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      background: #f1f5f9;
      color: #475569;
    }

    .answer-item.correct .answer-option {
      background: #10b981;
      color: white;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
    }

    .answer-text {
      flex: 1;
      color: #475569;
      padding-top: 0.125rem;
    }

    .answer-item.correct .answer-text {
      color: #065f46;
      font-weight: 600;
    }

    .question-images {
      flex-shrink: 0;
      width: 280px;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .image-placeholder {
      aspect-ratio: 1;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border: 2px dashed #cbd5e1;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .image-placeholder:hover {
      border-color: #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      color: #3b82f6;
    }

    .image-placeholder img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 0.375rem;
    }

    .additional-images {
      margin-top: 2rem;
      padding: 3rem 2rem;
      border-top: 1px solid #e2e8f0;
    }

    .additional-images-box {
      border: 2px dashed #cbd5e1;
      border-radius: 1rem;
      padding: 3rem;
      text-align: center;
      background: #f8fafc;
      transition: all 0.3s ease;
    }

    .additional-images-box:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .additional-images-text {
      color: #94a3b8;
      font-size: 1.125rem;
      font-weight: 600;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .export-button {
        display: none;
      }

      #examPdf {
        box-shadow: none;
        border-radius: 0;
      }

      .question-card {
        page-break-inside: avoid;
      }
    }
      @page {
  size: A4;
  margin: 0;
}

@media print {
  body {
    background: white;
    padding: 0 !important;
    margin: 0 !important;
  }

  #examPdf {
    box-shadow: none;
    border-radius: 0;
    width: 100%;
    margin: 0;
  }

  .exam-header {
    page-break-before: always;
  }

  .question-card {
    page-break-inside: avoid;
  }
}


    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .question-content {
        flex-direction: column;
      }

      .question-images {
        width: 100%;
      }

      .exam-header h1 {
        font-size: 1.5rem;
      }
    }
  </style>


        <div id="examPdf">
            <div class="exam-header">
                <h1>${exam.discipline_name}</h1>
            </div>

            <div class="exam-info">
                <div class="info-grid">
                    <div>
                        <div class="info-item">
                            <div class="info-label">Lớp:</div>
                            <div class="info-value">${exam.classNameSelected}</div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Họ tên:</div>
                            <div class="info-value">${exam.nameSelected}</div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">MSSV:</div>
                            <div class="info-value mssv">${exam.isSelected}</div>
                        </div>
                    </div>

                    <div>
                        <div class="info-item">
                            <div class="info-label">Số câu:</div>
                            <div class="info-value">${exam.countQuestions}/${exam.countQuestions}</div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Thời gian:</div>
                            <div class="info-value">${exam.time}p - ${exam.submissionTime}</div>
                        </div>

                        <div class="info-item">
                            <div class="info-label">Điểm:</div>
                            <div class="info-value">
                                <span class="score-badge">${exam.mark}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="questions-container">
                ${exam.questions.map((q, i) => `
                <div class="question-card">
                    <div class="question-header">
                        <div class="question-number">Câu ${i + 1}</div>
                        <div class="question-content">
                            <div class="question-left">
                                <div class="question-text">${q.text_question}</div>
                                <div class="answers-list">
                                    ${q.Answers_Text.map((ans, idx) => `
                                        <div class="answer-item ${q.correct_answer && ans.answer_option_id == q.correct_answer[0].correct_answer ? 'correct' : ''}">
                                            <div class="answer-option">${getOptionLetter(idx)}</div>
                                            <div class="answer-text">${ans.text_answer}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            ${q.source_image && q.source_image.length > 0 ? `
                            <div class="question-images">
                                <div class="images-grid">
                                    ${q.source_image.map((img, j) => `
                                        <div class="image-placeholder">
                                            ${img.source_image
        ? `<img src="${img.source_image}" alt="Hình ${j + 1}">`
        : `<span>${img.content}</span>`
      }
                                        </div>
                                    `).join('')}
                                </div>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>`;
  }

  return {
    // exportPDF: function (exam) {
    //   const wrapper = document.createElement('div');
    //   wrapper.innerHTML = exam;

    //   // Xóa toàn bộ margin/padding gây lỗi
    //   document.body.style.margin = "0";
    //   document.body.style.padding = "0";
    //   wrapper.style.margin = "0";
    //   wrapper.style.padding = "0";

    //   // Đảm bảo nội dung bắt đầu từ góc trên
    //   wrapper.style.position = "fixed";
    //   wrapper.style.top = "0";
    //   wrapper.style.left = "0";
    //   wrapper.style.width = "100%";

    //   document.body.appendChild(wrapper);
    //   wrapper.querySelectorAll('img').forEach(img => {
    //     img.onerror = () => { img.src = 'path-to-default-image.png'; };
    //     if (!img.src || img.naturalWidth === 0) img.src = 'path-to-default-image.png';
    //   });
    //   const element = wrapper.querySelector('#examPdf');

    //   const opt = {
    //     margin: 0, // bỏ margin của html2pdf
    //     filename: `de-thi-${exam.nameSelected}.pdf`,
    //     image: { type: 'jpeg', quality: 0.98 },
    //     html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    //   };

    //   html2pdf().set(opt).from(element).save().then(() => {
    //     wrapper.remove();
    //   });
    // }

    // exportPDF: async function (exam) {
    //   // Tạo wrapper tạm
    //   const wrapper = document.createElement('div');
    //   wrapper.innerHTML = exam;

    //   // CSS reset để tránh margin/padding ảnh hưởng
    //   wrapper.style.margin = '0';
    //   wrapper.style.padding = '0';
    //   wrapper.style.position = 'relative';
    //   wrapper.style.width = '100%';

    //   document.body.appendChild(wrapper);

    //   // Thay các ảnh lỗi bằng placeholder
    //   // wrapper.querySelectorAll('img').forEach(img => {
    //   //   img.onerror = () => {
    //   //     img.src = 'path-to-default-image.png'; // đổi thành ảnh placeholder hợp lệ
    //   //   };
    //   //   // Nếu ảnh chưa load xong nhưng src rỗng
    //   //   if (!img.src || img.naturalWidth === 0) {
    //   //     img.src = 'path-to-default-image.png';
    //   //   }
    //   // });

    //   const questions = wrapper.querySelectorAll('.question-card');
    //   const batchSize = 10; // số câu mỗi PDF batch
    //   const totalBatches = Math.ceil(questions.length / batchSize);

    //   const pdfChunks = [];

    //   for (let b = 0; b < totalBatches; b++) {
    //     // Tạo batch wrapper tạm
    //     const batchWrapper = document.createElement('div');
    //     batchWrapper.style.width = '100%';
    //     batchWrapper.style.margin = '0';
    //     batchWrapper.style.padding = '0';

    //     // Thêm câu hỏi batch này
    //     const start = b * batchSize;
    //     const end = Math.min(start + batchSize, questions.length);
    //     for (let i = start; i < end; i++) {
    //       batchWrapper.appendChild(questions[i].cloneNode(true));
    //     }

    //     document.body.appendChild(batchWrapper);

    //     const opt = {
    //       margin: 0,
    //       filename: `de-thi-${exam.nameSelected}-part${b + 1}.pdf`,
    //       image: { type: 'jpeg', quality: 0.9 },
    //       html2canvas: { scale: 1.5, useCORS: true, scrollY: 0 },
    //       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    //     };

    //     // Chờ html2pdf render xong
    //     await html2pdf().set(opt).from(batchWrapper).save();

    //     batchWrapper.remove();
    //   }

    //   wrapper.remove();
    // }
    exportPDF: async function (exam, user) {
      const { jsPDF } = window.jspdf;

      // Tạo wrapper chứa toàn bộ HTML đề thi
      const wrapper = document.createElement('div');
      wrapper.innerHTML = exam;
      wrapper.style.width = "794px"; // chuẩn A4 theo px (96dpi)
      wrapper.style.padding = "0";
      wrapper.style.margin = "0 auto";
      document.body.appendChild(wrapper);

      // CHỜ BROWSER RENDER HTML HOÀN TẤT
      await new Promise(resolve => setTimeout(resolve, 100));

      // CHỤP TOÀN BỘ WRAPPER THÀNH CANVAS
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      // Khởi tạo PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * (imgWidth / canvas.width);

      let position = 0;

      // Nếu ảnh cao hơn 1 trang → tự chia trang
      while (position < imgHeight) {
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          -position,
          imgWidth,
          imgHeight
        );

        position += pageHeight;

        if (position < imgHeight) pdf.addPage();
      }

      pdf.save(`${convertName(user.fullname)}.pdf`);

      wrapper.remove();
    },



  };
});
