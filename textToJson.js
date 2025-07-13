const fs = require('fs');
const path = require('path');

// Конфигурация
const inputFolder = './input_files'; // Папка с изходните текстови файлове
const outputJsonFile = 'combined_lessonTxt.json'; // Име на изходния JSON файл
const filesToProcess = ['info.txt']; // Файлове за обработка

// Проверка и създаване на папки
if (!fs.existsSync(inputFolder)) {
    fs.mkdirSync(inputFolder);
    console.log(`Създадена папка ${inputFolder}. Моля, поставете текстовите файлове в нея.`);
    process.exit(0);
}

async function processTextFilesToJson() {
    const combinedData = {};

    for (const file of filesToProcess) {
        try {
            const filePath = path.join(inputFolder, file);
            
            // Проверка дали файлът съществува
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️ Файл "${file}" липсва в папката ${inputFolder}`);
                continue;
            }

            // Четене на файла
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Добавяне към JSON обекта
            combinedData[file] = content;
            console.log(`✅ Файл "${file}" обработен!`);

        } catch (error) {
            console.error(`❌ Грешка при обработка на ${file}:`, error.message);
        }
    }

    // Записване на JSON файла
    fs.writeFileSync(outputJsonFile, JSON.stringify(combinedData, null, 2));
    console.log(`\n🎉 Всички текстови файлове са конвертирани в "${outputJsonFile}"!`);
}

processTextFilesToJson();