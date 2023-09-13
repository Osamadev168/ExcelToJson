import { useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css'
function App() {
  const [jsonData, setJsonData] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
          setJsonData(parsedData.questions);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  const generateExcel = () => {
    let  subjectName = "subject_name";
    if (jsonData) {
      const ws = XLSX.utils.aoa_to_sheet([['Content', 'Option 1', 'Option 2', 'Option 3', 'Option 4' , 'Difficulty']]);
      jsonData.forEach((question) => {
        const questionText = question.ask.content.html;
         subjectName = question.directory.folder;
        const correctChoice = question.multipleChoice.choices.find(
          (choice) => choice.percentage === 100 && choice.percentage !== null && choice.percentage !== undefined
        );
        if (correctChoice) {
          const options = question.multipleChoice.choices
            .filter((choice) => choice !== correctChoice && choice.percentage !== null)
            .map((choice) => choice.content.html);
          const difficultyLevel = question.directory.tags.Level;
          XLSX.utils.sheet_add_aoa(ws, [[questionText, correctChoice.content.html, ...options, difficultyLevel]] , {
            origin : -1
          });
        }
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, subjectName);
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subjectName}.xlsx`;
      a.click()
      URL.revokeObjectURL(url)
    }
  };
  return (
    <div className='mainDiv'>
     <h1>Json to Excel Converter</h1>
      <input id='file-input' type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={generateExcel} disabled={!jsonData} className='button'>
       Download Excel File
      </button>
    </div>
  );
}
export default App;
