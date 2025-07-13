// Импортиране на необходимите модули
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import yaml from 'js-yaml';

// URL към суровия YAML файл в GitHub
const YAML_URL = 'https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/refs/heads/stage/src/bg/2025-03-cc/pdf.yml';

// Име на папката, в която ще се запазват файловете
const DOWNLOAD_DIR = 'downloaded_lessons';

async function downloadFile(fileUrl, outputPath) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileUrl}: ${response.statusText}`);
    }
    const fileBuffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(outputPath, fileBuffer);
    console.log(`✅ Успешно изтеглен: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Грешка при изтегляне на ${fileUrl}:`, error.message);
  }
}

async function main() {
  try {
    // 1. Създаване на папката за изтегляне
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
    console.log(`📂 Файловете ще бъдат запазени в папка: ./${DOWNLOAD_DIR}`);

    // 2. Извличане на YAML файла
    console.log('... Извличане на списъка с уроци от YAML файла...');
    const response = await fetch(YAML_URL);
    if (!response.ok) {
      throw new Error(`Неуспешно извличане на YAML файла: ${response.statusText}`);
    }
    const yamlText = await response.text();
    
    // 3. Парсиране на YAML съдържанието
    const data = yaml.load(yamlText);
    
    if (!data || !data.pdf || !Array.isArray(data.pdf)) {
      throw new Error('YAML файлът има неочаквана структура');
    }
    
    const pdfFiles = data.pdf;
    console.log(`🔎 Намерени ${pdfFiles.length} PDF файла за изтегляне.`);

    // 4. Изтегляне на файловете
    const downloadPromises = pdfFiles.map((file, index) => {
      if (file.src) {
        // Използваме номера на урока от target или индекса
        const lessonNumber = file.target ? file.target.split('/').pop() : (index + 1).toString().padStart(2, '0');
        const fileName = `Урок-${lessonNumber}.pdf`;
        const localPath = path.join(DOWNLOAD_DIR, fileName);
        return downloadFile(file.src, localPath);
      }
    });

    await Promise.all(downloadPromises);
    console.log('\n🎉 Всички файлове са изтеглени успешно!');

  } catch (error) {
    console.error('\n🔥 Възникна сериозна грешка в скрипта:', error.message);
  }
}

// Изпълнение на основната функция
main();