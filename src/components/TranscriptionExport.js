import jsPDF from 'jspdf'; // Import jsPDF for PDF generation
import React, { useEffect, useState } from 'react'; // Import React and useState hook

// TranscriptionExport component definition
const TranscriptionExport = ({ transcription }) => {
  const [savedTranscriptions, setSavedTranscriptions] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');

   // Generate a dynamic title based on the transcription
   const generateTitle = () => {
    // If transcription is empty, use a default title
    if (!transcription) return 'Untitled Transcription';
    
    // Create a title by taking the first 5-7 words and adding an ellipsis
    return transcription.split(' ').slice(0, 7).join(' ') + '...';
  };

// View Saved Transcriptions
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('transcriptions') || '[]'); 
    setSavedTranscriptions(saved);
  },[]);

  // Function to save transcription to local storage
  const saveToLocalStorage = () => {// Retrieve existing transcriptions from local storage or initialize empty array      
        // Create new transcription object
    const newTranscription = {
      id: Date.now(),
      title: generateTitle(),
      text: transcription,
      timestamp: new Date().toLocaleString()
    };
    // Add new transcription to the array
    const updatedTranscriptions = [...savedTranscriptions, newTranscription];
    localStorage.setItem('transcriptions', JSON.stringify(updatedTranscriptions)); 
    setSavedTranscriptions(updatedTranscriptions);  // Save updated array back to local storage
    alert('Transcription saved successfully!');
  };

  // Function to export transcription as a text file
  const exportAsTextFile = (textToExport, fileName) => {
    const blob = new Blob([textToExport], { type: 'text/plain' });    // Create a Blob with the transcription text
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');    // Create a temporary link element
    link.href = url;
    link.download = `${fileName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);// Append link to body, click it, and remove it
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);// Clean up the URL object
  };

   // Function to export transcription as a PDF
  const exportAsPDF = (textToExport, fileName) => {
    const doc = new jsPDF();
    
    // Set PDF document properties
    doc.setProperties({
      title: fileName,
      subject: 'Transcribed Text',
      author: 'Unlimited Transcription Tool',
      keywords: 'transcription, export, pdf',
      creator: 'Unlimited Transcription Tool'
    });

    // Add title to PDF
    doc.setFontSize(18);
    doc.text(fileName, 10, 10);

    // Add timestamp to PDF
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 20);

    // Add transcription text to PDF
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(textToExport, 180);
    doc.text(splitText, 10, 30);

    // Save PDF
    doc.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
  };

  // Function to delete a saved transcription
  const deleteSavedTranscription = (id) => {
    const updatedTranscriptions = savedTranscriptions.filter(t => t.id !== id);
    localStorage.setItem('transcriptions', JSON.stringify(updatedTranscriptions));
    setSavedTranscriptions(updatedTranscriptions);
  };

  // State and handler for search functionality
const handleSearch = (e) => setSearchTerm(e.target.value); 
  // Filter transcriptions based on search term
const filteredTranscriptions = savedTranscriptions.filter(transcription => 
    transcription.text.toLowerCase().includes(searchTerm.toLowerCase()) 
);

    // Render the component
  return (
    <div style={{ width: '80%', marginTop: '20px' }}>
      {/* Statistics Section */}
      <div className="stats-container">
        <div className="stats-item">
        <strong>Characters:</strong> {transcription.length}
        </div>
        <div className="stats-item">
        <strong>Words:</strong> {transcription.split(/\s+/).filter(Boolean).length}
        </div>
        <div className="stats-item">
        <strong>Paragraphs:</strong> {transcription.split(/\n+/).filter(Boolean).length}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button 
          onClick={saveToLocalStorage}
          className="btn btn-save"
        >
          Save Transcription
        </button>
        <button 
          onClick={() => exportAsTextFile(transcription, generateTitle())}
          className="btn btn-export-text"
        >
          Export as Text
        </button>
        <button 
          onClick={() => exportAsPDF(transcription, generateTitle())}
          className="btn btn-export-pdf"
        >
          Export as PDF
        </button>
      </div>

      {/* Saved Transcriptions Section */}
      <div>
        {/* Search input for saved transcriptions */}
        <input 
          type="text"
          placeholder="Search saved transcriptions..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />

        <h3>Saved Transcriptions</h3>
        {/* Display message if no transcriptions, otherwise show list */}
        {(searchTerm ? filteredTranscriptions : savedTranscriptions).length === 0 ? (
          <p>No saved transcriptions</p>
        ) : (
          <ul className="saved-transcriptions-list">
            {/* Map through and display saved transcriptions */}
            {(searchTerm ? filteredTranscriptions : savedTranscriptions).map((saved) => (
              <li 
                key={saved.id}
                className="saved-transcription-item"
              >
                <div className="saved-transcription-header">
                  <strong>Timestamp:</strong> {saved.timestamp}
                  <button 
                    onClick={() => deleteSavedTranscription(saved.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
                <strong>Title:</strong> {saved.title} 
                <div> 
                  <button onClick={() => exportAsTextFile(saved.text, saved.title)} 
                  className="btn btn-export-text" >
                  Export as Text 
                  </button> 
                  <button onClick={() => exportAsPDF(saved.text, saved.title)} 
                  className="btn btn-export-pdf" 
                  > Export as PDF 
                  </button> 
                </div>
              {/* Display truncated text if longer than 200 characters */}
                <p>
                  {saved.text.length > 200 
                    ? saved.text.substring(0, 200) + '...' 
                    : saved.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
// Export the TranscriptionExport component as the default export
export default TranscriptionExport;