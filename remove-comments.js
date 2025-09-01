#!/usr/bin/env node

/**
 * Script to remove all comments except for // biome-ignore comments
 * Supports TypeScript, JavaScript, TSX, and JSX files
 */

import fs from 'fs';
import path from 'path';

// File extensions to process
const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Pattern to match biome-ignore comments (preserve these)
const BIOME_IGNORE_PATTERN = /\/\/\s*biome-ignore/;

function removeCommentsFromCode(content) {
  const lines = content.split('\n');
  const result = [];
  let insideBlockComment = false;
  let blockCommentStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let processedLine = line;

    // Handle multi-line comments (including JSX comments)
    if (insideBlockComment) {
      let blockCommentEnd = line.indexOf('*/');
      let jsxCommentEnd = line.indexOf('*/}');
      
      // Check for JSX comment end first
      if (jsxCommentEnd !== -1 && (blockCommentEnd === -1 || jsxCommentEnd <= blockCommentEnd)) {
        processedLine = line.substring(jsxCommentEnd + 3);
        insideBlockComment = false;
        blockCommentStartLine = -1;
      } else if (blockCommentEnd !== -1) {
        // End of regular block comment found
        processedLine = line.substring(blockCommentEnd + 2);
        insideBlockComment = false;
        blockCommentStartLine = -1;
      } else {
        // Still inside block comment, skip this line
        continue;
      }
    }

    // Look for start of block comments (including JSX comments {/* */})
    let blockCommentStart = processedLine.indexOf('/*');
    let jsxCommentStart = processedLine.indexOf('{/*');
    
    // Handle JSX comments first if they appear before regular block comments
    if (jsxCommentStart !== -1 && (blockCommentStart === -1 || jsxCommentStart < blockCommentStart)) {
      const jsxCommentEnd = processedLine.indexOf('*/}', jsxCommentStart + 3);
      if (jsxCommentEnd !== -1) {
        // Complete JSX comment on same line
        processedLine = processedLine.substring(0, jsxCommentStart) + 
                      processedLine.substring(jsxCommentEnd + 3);
      } else {
        // JSX comment starts but doesn't end on this line
        processedLine = processedLine.substring(0, jsxCommentStart);
        insideBlockComment = true;
        blockCommentStartLine = i;
      }
    } else {
      // Handle regular block comments
      while (blockCommentStart !== -1) {
        const blockCommentEnd = processedLine.indexOf('*/', blockCommentStart + 2);
        
        if (blockCommentEnd !== -1) {
          // Complete block comment on same line
          processedLine = processedLine.substring(0, blockCommentStart) + 
                        processedLine.substring(blockCommentEnd + 2);
        } else {
          // Block comment starts but doesn't end on this line
          processedLine = processedLine.substring(0, blockCommentStart);
          insideBlockComment = true;
          blockCommentStartLine = i;
          break;
        }
        
        // Look for more block comments on the same line
        blockCommentStart = processedLine.indexOf('/*', blockCommentStart);
      }
    }

    // Handle single-line comments
    let inString = false;
    let stringChar = '';
    let escaped = false;
    
    for (let j = 0; j < processedLine.length; j++) {
      const char = processedLine[j];
      const nextChar = processedLine[j + 1];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
        continue;
      }
      
      if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
        continue;
      }
      
      if (!inString && char === '/' && nextChar === '/') {
        // Check if this is a biome-ignore comment
        const restOfLine = processedLine.substring(j);
        if (BIOME_IGNORE_PATTERN.test(restOfLine)) {
          // This is a biome-ignore comment, preserve it
          break;
        } else {
          // Regular comment, remove it
          processedLine = processedLine.substring(0, j).trimEnd();
          break;
        }
      }
    }

    // Add the processed line if it's not empty or if it contains content
    if (processedLine.trim() !== '' || processedLine === '') {
      result.push(processedLine);
    }
  }

  // Remove trailing empty lines but preserve intentional spacing
  while (result.length > 0 && result[result.length - 1].trim() === '') {
    result.pop();
  }

  return result.join('\n') + (result.length > 0 ? '\n' : '');
}

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const processedContent = removeCommentsFromCode(content);
    
    // Only write if content changed
    if (content !== processedContent) {
      fs.writeFileSync(filePath, processedContent, 'utf8');
      console.log(`  ✓ Comments removed from ${filePath}`);
      return true;
    } else {
      console.log(`  - No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath, excludeDirs = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let processedCount = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(entry.name)) {
        console.log(`Skipping directory: ${fullPath}`);
        continue;
      }
      
      processedCount += processDirectory(fullPath, excludeDirs);
    } else if (entry.isFile() && shouldProcessFile(fullPath)) {
      if (processFile(fullPath)) {
        processedCount++;
      }
    }
  }

  return processedCount;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node remove-comments.js <path> [excluded-dirs...]');
    console.log('');
    console.log('Examples:');
    console.log('  node remove-comments.js src/');
    console.log('  node remove-comments.js . node_modules dist build');
    console.log('  node remove-comments.js src/components/');
    console.log('');
    console.log('This script removes all comments except for // biome-ignore comments');
    process.exit(1);
  }

  const targetPath = args[0];
  const excludeDirs = args.slice(1);

  // Default exclude directories
  const defaultExcludes = ['node_modules', 'dist', 'build', '.git', '.next', 'coverage'];
  const allExcludes = [...new Set([...defaultExcludes, ...excludeDirs])];

  console.log(`Starting comment removal process...`);
  console.log(`Target: ${path.resolve(targetPath)}`);
  console.log(`Excluding directories: ${allExcludes.join(', ')}`);
  console.log(`Preserving: // biome-ignore comments`);
  console.log('');

  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Path "${targetPath}" does not exist`);
    process.exit(1);
  }

  const stat = fs.statSync(targetPath);
  let processedCount = 0;

  if (stat.isFile()) {
    if (shouldProcessFile(targetPath)) {
      processedCount = processFile(targetPath) ? 1 : 0;
    } else {
      console.log(`File type not supported: ${targetPath}`);
    }
  } else if (stat.isDirectory()) {
    processedCount = processDirectory(targetPath, allExcludes);
  }

  console.log('');
  console.log(`✓ Process completed. ${processedCount} files were modified.`);
}

// Check if this is the main module (ES module equivalent of require.main === module)
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname || 
                     process.argv[1].endsWith('remove-comments.js');

if (isMainModule) {
  main();
}
