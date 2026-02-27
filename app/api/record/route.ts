import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 烟丝试验记录接口
interface RecordInput {
  品牌: string;
  克重?: string;
  醒草时间?: string;
  烟斗的类型?: string;
  环境温度?: string;
  环境湿度?: string;
  填充质量?: string;
  抽吸质量?: string;
  主观描述?: string;
}

// 转换数据库记录为前端格式
function transformRecord(dbRecord: any): RecordInput & { id: number } {
  return {
    id: dbRecord.id,
    品牌: dbRecord.brand,
    克重: dbRecord.weight || '',
    醒草时间: dbRecord.awakingTime || '',
    烟斗的类型: dbRecord.pipeType || '',
    环境温度: dbRecord.temperature || '',
    环境湿度: dbRecord.humidity || '',
    填充质量: dbRecord.fillQuality || '',
    抽吸质量: dbRecord.drawQuality || '',
    主观描述: dbRecord.description || '',
  };
}

// 转换前端格式为数据库格式
function transformToDb(record: RecordInput) {
  return {
    brand: record.品牌,
    weight: record.克重 || null,
    awakingTime: record.醒草时间 || null,
    pipeType: record.烟斗的类型 || null,
    temperature: record.环境温度 || null,
    humidity: record.环境湿度 || null,
    fillQuality: record.填充质量 || null,
    drawQuality: record.抽吸质量 || null,
    description: record.主观描述 || null,
  };
}

// GET: 读取所有记录
export async function GET() {
  try {
    const dbRecords = await prisma.tobaccoRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const records = dbRecords.map(transformRecord);
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error reading records:', error);
    return NextResponse.json({ success: false, error: 'Failed to read records' }, { status: 500 });
  }
}

// POST: 添加或更新记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, record, id } = body;
    
    if (action === 'add') {
      // 添加新记录
      const newRecord = await prisma.tobaccoRecord.create({
        data: transformToDb(record),
      });
      const allRecords = await prisma.tobaccoRecord.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ 
        success: true, 
        records: allRecords.map(transformRecord),
        newRecord: transformRecord(newRecord),
      });
    } else if (action === 'update' && id) {
      // 更新现有记录
      const updatedRecord = await prisma.tobaccoRecord.update({
        where: { id: Number(id) },
        data: transformToDb(record),
      });
      const allRecords = await prisma.tobaccoRecord.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ 
        success: true, 
        records: allRecords.map(transformRecord),
        updatedRecord: transformRecord(updatedRecord),
      });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action or missing id' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error saving record:', error);
    return NextResponse.json({ success: false, error: 'Failed to save record' }, { status: 500 });
  }
}
