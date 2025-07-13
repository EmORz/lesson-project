import fetch from 'node-fetch';
import fs from 'fs';

const baseUrl = 'https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/refs/heads/stage/src/bg/2025-03/13/';
const filesToFetch = ['info.yml', 'inside-story.md', '01.md', '02.md', '03.md', '04.md', '05.md', '06.md', '07.md'];
const folderName = 'downloaded_files';
const outputJsonFile = 'combined_lessons.json';

// Създава папка ако не съществува
if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
}

async function downloadAndCombineToJson() {
    const combinedData = {}; // Обект за съхранение на всички данни

    for (const file of filesToFetch) {
        try {
            const response = await fetch(baseUrl + file);
            if (!response.ok) throw new Error(`Грешка при ${file}: ${response.statusText}`);
            
            const content = await response.text();
            
            // Записване на всеки файл в папката
            fs.writeFileSync(`${folderName}/${file}`, content);
            console.log(`✅ Файл "${file}" изтеглен!`);

            // Добавяне към JSON обекта
            combinedData[file] = content; // Ключ: името на файла, стойност: съдържание

        } catch (error) {
            console.error(`❌ Грешка при ${file}:`, error.message);
        }
    }

    // Записване на JSON файла
    fs.writeFileSync(outputJsonFile, JSON.stringify(combinedData, null, 2)); // Pretty-print с 2 интервала
    console.log(`\n🎉 Всички файлове са обединени в "${outputJsonFile}"!`);
}

downloadAndCombineToJson(); 