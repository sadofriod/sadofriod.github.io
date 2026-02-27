import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CSV_FILE_PATH = path.join(process.cwd(), 'app/record/烟丝试验.csv');

interface Record {
  品牌: string;
  克重: string;
  醒草时间: string;
  烟斗的类型: string;
  环境温度: string;
  环境湿度: string;
  填充质量: string;
  抽吸质量: string;
  主观描述: string;
}

// 解析CSV
function parseCSV(content: string): Record[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',');
  const records: Record[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record as Record);
  }
  
  return records;
}

// 将记录转换为CSV格式
function recordsToCSV(records: Record[]): string {
  const headers = ['品牌', '克重', '醒草时间', '烟斗的类型', '环境温度', '环境湿度', '填充质量', '抽吸质量', '主观描述'];
  const lines = [headers.join(',')];
  
  records.forEach(record => {
    const values = headers.map(header => record[header as keyof Record] || '');
    lines.push(values.join(','));
  });
  
  return lines.join('\n') + '\n';
}

// GET: 读取所有记录
export async function GET() {
  try {
    const content = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const records = parseCSV(content);
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return NextResponse.json({ success: false, error: 'Failed to read CSV file' }, { status: 500 });
  }
}

// POST: 添加或更新记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, record, index } = body;
    
    const content = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const records = parseCSV(content);
    
    if (action === 'add') {
      // 添加新记录
      records.push(record);
    } else if (action === 'update' && typeof index === 'number') {
      // 更新现有记录
      if (index >= 0 && index < records.length) {
        records[index] = record;
      } else {
        return NextResponse.json({ success: false, error: 'Invalid index' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
    
    // 写回文件
    const newContent = recordsToCSV(records);
    await fs.writeFile(CSV_FILE_PATH, newContent, 'utf-8');
    
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error writing CSV:', error);
    return NextResponse.json({ success: false, error: 'Failed to write CSV file' }, { status: 500 });
  }
}
