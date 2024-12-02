const xlsx = require('xlsx');

// Function to get student marks by student ID
function getStudentMarksById(studentId, filePath) {
  const workbook = xlsx.readFile(filePath);  // Read the correct Excel file
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const students = xlsx.utils.sheet_to_json(sheet);

  console.log("Searching for student ID:", studentId);
  const studentData = students.find((row) => {
    const studentCode = String(row['الكود']).trim();
    const searchId = String(studentId).trim();
    return studentCode === searchId;
  });

  if (studentData) {
    console.log(`Student found with ID: ${studentId}`);
    return studentData;
  } else {
    console.log(`No student data found for ID: ${studentId}`);
    return null;
  }
}

module.exports = { getStudentMarksById };  // Export the function
