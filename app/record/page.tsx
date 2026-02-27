'use client';

import { useState, useEffect } from 'react';

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

export default function RecordPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record>({
    品牌: '',
    克重: '',
    醒草时间: '',
    烟斗的类型: '',
    环境温度: '',
    环境湿度: '',
    填充质量: '',
    抽吸质量: '',
    主观描述: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载记录
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/record');
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      alert('加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 提交表单（添加或更新）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const action = editingIndex !== null ? 'update' : 'add';
      const response = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          record: formData,
          index: editingIndex,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
        resetForm();
        alert(editingIndex !== null ? '记录已更新' : '记录已添加');
      } else {
        alert('操作失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 编辑记录
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(records[index]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      品牌: '',
      克重: '',
      醒草时间: '',
      烟斗的类型: '',
      环境温度: '',
      环境湿度: '',
      填充质量: '',
      抽吸质量: '',
      主观描述: '',
    });
    setEditingIndex(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">烟丝试验记录</h1>

        {/* 表单 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingIndex !== null ? '编辑记录' : '添加新记录'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  品牌
                </label>
                <input
                  type="text"
                  name="品牌"
                  value={formData.品牌}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  克重
                </label>
                <input
                  type="text"
                  name="克重"
                  value={formData.克重}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  醒草时间
                </label>
                <input
                  type="text"
                  name="醒草时间"
                  value={formData.醒草时间}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  烟斗的类型
                </label>
                <input
                  type="text"
                  name="烟斗的类型"
                  value={formData.烟斗的类型}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  环境温度
                </label>
                <input
                  type="text"
                  name="环境温度"
                  value={formData.环境温度}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  环境湿度
                </label>
                <input
                  type="text"
                  name="环境湿度"
                  value={formData.环境湿度}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  填充质量
                </label>
                <input
                  type="text"
                  name="填充质量"
                  value={formData.填充质量}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  抽吸质量
                </label>
                <input
                  type="text"
                  name="抽吸质量"
                  value={formData.抽吸质量}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  主观描述
                </label>
                <textarea
                  name="主观描述"
                  value={formData.主观描述}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '提交中...' : editingIndex !== null ? '更新记录' : '添加记录'}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  取消编辑
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 记录列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-6 bg-gray-50 text-gray-800">
            所有记录 ({records.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    品牌
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    克重
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    醒草时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    烟斗类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    环境温度
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    环境湿度
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    填充质量
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    抽吸质量
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    主观描述
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.品牌}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.克重}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.醒草时间}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.烟斗的类型}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.环境温度}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.环境湿度}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.填充质量}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.抽吸质量}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {record.主观描述}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                暂无记录，请添加新记录
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
