'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

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
      setSnackbar({
        open: true,
        message: '加载记录失败',
        severity: 'error',
      });
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
        setSnackbar({
          open: true,
          message: editingIndex !== null ? '记录已更新' : '记录已添加',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: '操作失败: ' + data.error,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({
        open: true,
        message: '提交失败',
        severity: 'error',
      });
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

  // 关闭 Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        烟丝试验记录
      </Typography>

      {/* 表单 */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
          {editingIndex !== null ? '编辑记录' : '添加新记录'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="品牌"
                name="品牌"
                value={formData.品牌}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="克重"
                name="克重"
                value={formData.克重}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="醒草时间"
                name="醒草时间"
                value={formData.醒草时间}
                onChange={handleInputChange}
                placeholder="00:04:30"
                helperText="格式: hh:mm:ss"
                inputProps={{
                  pattern: '[0-9]{2}:[0-9]{2}:[0-9]{2}',
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="烟斗的类型"
                name="烟斗的类型"
                value={formData.烟斗的类型}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="环境温度"
                name="环境温度"
                value={formData.环境温度}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="环境湿度"
                name="环境湿度"
                value={formData.环境湿度}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="填充质量"
                name="填充质量"
                value={formData.填充质量}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="抽吸质量"
                name="抽吸质量"
                value={formData.抽吸质量}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="主观描述"
                name="主观描述"
                value={formData.主观描述}
                onChange={handleInputChange}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={editingIndex !== null ? <SaveIcon /> : <AddIcon />}
              size="large"
            >
              {isSubmitting ? '提交中...' : editingIndex !== null ? '更新记录' : '添加记录'}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetForm}
                startIcon={<CancelIcon />}
                size="large"
              >
                取消编辑
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 记录列表 */}
      <Paper elevation={3}>
        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5" component="h2" fontWeight="medium">
            所有记录 ({records.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>品牌</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>克重</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>醒草时间</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>烟斗类型</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>环境温度</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>环境湿度</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>填充质量</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>抽吸质量</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>主观描述</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      暂无记录，请添加新记录
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{record.品牌}</TableCell>
                    <TableCell>{record.克重}</TableCell>
                    <TableCell>{record.醒草时间}</TableCell>
                    <TableCell>{record.烟斗的类型}</TableCell>
                    <TableCell>{record.环境温度}</TableCell>
                    <TableCell>{record.环境湿度}</TableCell>
                    <TableCell>{record.填充质量}</TableCell>
                    <TableCell>{record.抽吸质量}</TableCell>
                    <TableCell>
                      <Tooltip title={record.主观描述} arrow>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {record.主观描述}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="编辑">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(index)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Snackbar 通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
