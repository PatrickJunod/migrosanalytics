import { ref } from 'vue';
import Papa from 'papaparse';

export function useTransactions() {
  const purchases = ref([]);
  const loadedFiles = ref([]);
  const isLoading = ref(false);

  /**
   * Parse a CSV file and add purchases to the list
   * @param {File} file - The CSV file to parse
   * @returns {Promise<void>}
   */
  function parseCSV(file) {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          results.data.forEach(row => {
            if (row.Datum && row.Artikel && row.Umsatz) {
              const dateParts = row.Datum.split('.');
              const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

              purchases.value.push({
                date: date,
                time: row.Zeit || '',
                store: row.Filiale || '',
                product: row.Artikel || '',
                quantity: parseFloat(row.Menge.replace(',', '.')) || 0,
                promo: parseFloat(row.Aktion.replace(',', '.')) || 0,
                price: parseFloat(row.Umsatz.replace(',', '.')) || 0,
                transactionNumber: row.Transaktionsnummer || ''
              });
            }
          });
          resolve();
        }
      });
    });
  }

  /**
   * Process multiple CSV files
   * @param {FileList} files - The files to process
   * @returns {Promise<void>}
   */
  async function processFiles(files) {
    isLoading.value = true;

    for (let file of files) {
      if (file.name.endsWith('.csv') && !loadedFiles.value.includes(file.name)) {
        await parseCSV(file);
        loadedFiles.value.push(file.name);
      }
    }

    // Wait a bit then set loading to false
    await new Promise(resolve => setTimeout(resolve, 500));
    isLoading.value = false;
  }

  /**
   * Remove a file and reload data
   * @param {string} fileName - The file name to remove
   */
  function removeFile(fileName) {
    const index = loadedFiles.value.indexOf(fileName);
    if (index > -1) {
      loadedFiles.value.splice(index, 1);
      if (loadedFiles.value.length === 0) {
        purchases.value = [];
      }
    }
  }

  /**
   * Clear all data
   */
  function clearAll() {
    purchases.value = [];
    loadedFiles.value = [];
  }

  return {
    purchases,
    loadedFiles,
    isLoading,
    processFiles,
    removeFile,
    clearAll
  };
}
