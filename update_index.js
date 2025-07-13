import fetch from 'node-fetch';
import fs from 'fs';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

// --- НОВО: Динамична конфигурация за урока ---
const lang = 'bg';  
const quarter = '2025-03'; // Година и тримесечие
const lesson = '13';       // Номер на урока

// --- НОВО: Генерираме динамично име на файла ---
// Заменяме '-' с '_' за по-чисто име на файла: 2025-03 -> 2025_03
const dynamicJsonFilename = `Lesson_${quarter.replace('-', '_')}_${lesson}.json`; 
// Резултат: "Lesson_2025_03_13.json"

// --- Конфигурацията се създава автоматично от горните променливи ---
const baseUrl = `https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/refs/heads/stage/src/${lang}/${quarter}/${lesson}/`;
const filesToFetch = ['info.yml', 'inside-story.md', '01.md', '02.md', '03.md', '04.md', '05.md', '06.md', '07.md'];
const folderName = 'downloaded_files';

// --- Конфигурация за GitHub Gist ---
if (!process.env.GITHUB_TOKEN) {
    console.error('❌ Грешка: GITHUB_TOKEN не е намерен. Моля, създайте .env файл и добавете вашия токен.');
    process.exit(1);
}
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
}

/**
 * ВИНАГИ създава нов Gist със съдържанието на файла.
 * @param {string} filename - Името на файла в Gist.
 * @param {string} content - Съдържанието на файла.
 */
async function uploadNewGist(filename, content) {
    try {
        console.log(`\n🚀 Създаване на нов Gist с файл "${filename}"...`);
        
        const response = await octokit.gists.create({
            description: `Sabbath School Lesson - ${lang.toUpperCase()} ${quarter} L${lesson}`, // По-описателно заглавие на Gist-а
            public: true,
            files: {
                [filename]: { // Тук се използва динамичното име!
                    content: content,
                },
            }
        });

        console.log(`✅ Нов Gist е създаден успешно! URL: ${response.data.html_url}`);

    } catch (error) {
        console.error('❌ Грешка при създаване на Gist:', error.message);
    }
}

async function downloadAndCombineToJson() {
    const combinedData = {};

    for (const file of filesToFetch) {
        try {
            const response = await fetch(baseUrl + file);
            if (!response.ok) throw new Error(`Грешка при ${file}: ${response.statusText}`);
            
            const content = await response.text();
            
            fs.writeFileSync(`${folderName}/${file}`, content);
            console.log(`✅ Файл "${file}" изтеглен!`);

            combinedData[file] = content;

        } catch (error) {
            console.error(`❌ Грешка при изтегляне на ${file}:`, error.message);
            return; 
        }
    }

    const jsonContent = JSON.stringify(combinedData, null, 2);
    // Използваме динамичното име за локалния файл
    fs.writeFileSync(dynamicJsonFilename, jsonContent); 
    console.log(`\n🎉 Всички файлове са обединени в "${dynamicJsonFilename}"!`);

    // Използваме динамичното име и за качване
    await uploadNewGist(dynamicJsonFilename, jsonContent);
}

downloadAndCombineToJson();