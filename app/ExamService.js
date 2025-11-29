app.factory("ExamService", function() {
  let data_exam_questions = [];

  return {
    getAll: function() {
      return data_exam_questions;
    },
    setAll: function(data) {
      data_exam_questions = data;
    },
    updateExam: function(exam) {
      const index = data_exam_questions.findIndex(q => q.examId === exam.examId);
      if (index !== -1) {
        data_exam_questions[index] = exam;
      }
    }
  };
});
