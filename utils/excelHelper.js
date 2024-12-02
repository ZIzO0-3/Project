// getStudentMarks.js
const xlsx = require('xlsx');

function getStudentMarksById(studentId) {
  const workbook = xlsx.readFile('./data/2sec.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const students = xlsx.utils.sheet_to_json(sheet);

  console.log("Searching for student ID:", studentId); // Print the student search log
  const studentData = students.find((row) => {
    const studentCode = String(row['الكود']).trim();
    const searchId = String(studentId).trim();
    return studentCode === searchId;
  });

  return studentData || null;
}

module.exports = { getStudentMarksById };
