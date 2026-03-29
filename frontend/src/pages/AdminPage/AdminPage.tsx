import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  People,
  SportsSoccer,
  LocationOn,
  Report,
  Block,
  CheckCircle,
  Delete,
  Visibility,
  Warning,
} from '@mui/icons-material';
import adminApi, { type AdminUser, type AdminMatch, type AdminPlace, type AdminComplaint } from '../../api/admin.api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  ACTIVE: 'success',
  OPEN: 'success',
  READY: 'info',
  IN_PROGRESS: 'warning',
  FINISHED: 'default',
  CANCELLED: 'error',
  BLOCKED: 'error',
  BANNED: 'error',
  PENDING: 'warning',
  REJECTED: 'error',
  RESOLVED: 'success',
  REVIEWED: 'info',
  FREE: 'success',
  PAID: 'warning',
};

export const AdminPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    totalPlaces: 0,
    pendingComplaints: 0,
    activeUsers: 0,
  });

  // Data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'block' | 'delete' | 'resolve'>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchStatistics();
    loadData();
  }, [tabValue, page]);

  const fetchStatistics = async () => {
    try {
      const data = await adminApi.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (tabValue) {
        case 0: // Users
          data = await adminApi.getAllUsers(page, rowsPerPage);
          setUsers(data.content);
          setTotalItems(data.total);
          break;
        case 1: // Matches
          data = await adminApi.getAllMatches(page, rowsPerPage);
          setMatches(data.content);
          setTotalItems(data.total);
          break;
        case 2: // Places
          data = await adminApi.getAllPlaces(page, rowsPerPage);
          setPlaces(data.content);
          setTotalItems(data.total);
          break;
        case 3: // Complaints
          data = await adminApi.getPendingComplaints(page, rowsPerPage);
          setComplaints(data.content);
          setTotalItems(data.total);
          break;
      }
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // User actions
  const handleBlockUser = async (userId: string) => {
    try {
      await adminApi.blockUser(userId);
      loadData();
    } catch (err) {
      setError('Не удалось заблокировать пользователя');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      loadData();
    } catch (err) {
      setError('Не удалось удалить пользователя');
    }
  };

  // Match actions
  const handleCancelMatch = async (matchId: number) => {
    try {
      await adminApi.cancelMatch(matchId);
      loadData();
    } catch (err) {
      setError('Не удалось отменить матч');
    }
  };

  // Place actions
  const handleApprovePlace = async (placeId: number) => {
    try {
      await adminApi.approvePlace(placeId);
      loadData();
    } catch (err) {
      setError('Не удалось одобрить площадку');
    }
  };

  const handleRejectPlace = async (placeId: number) => {
    try {
      await adminApi.rejectPlace(placeId);
      loadData();
    } catch (err) {
      setError('Не удалось отклонить площадку');
    }
  };

  // Complaint actions
  const handleResolveComplaint = async (complaintId: number, decision: 'ACCEPTED' | 'REJECTED') => {
    try {
      await adminApi.resolveComplaint(complaintId, decision);
      loadData();
      setDialogOpen(false);
    } catch (err) {
      setError('Не удалось рассмотреть жалобу');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Активен',
      BLOCKED: 'Заблокирован',
      BANNED: 'Забанен',
      OPEN: 'Открыт',
      READY: 'Готов',
      IN_PROGRESS: 'В процессе',
      FINISHED: 'Завершён',
      CANCELLED: 'Отменён',
      PENDING: 'Ожидает',
      ACTIVE: 'Активна',
      INACTIVE: 'Неактивна',
      REJECTED: 'Отклонена',
      RESOLVED: 'Решена',
      REVIEWED: 'Рассмотрена',
      FREE: 'Бесплатная',
      PAID: 'Платная',
    };
    return labels[status] || status;
  };

  if (loading && users.length === 0 && matches.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Заголовок */}
        <Typography variant="h4" component="h1" gutterBottom>
          Админ-панель
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Статистика */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <People color="primary" sx={{ fontSize: 40 }} />
                  <div>
                    <Typography variant="h4">{stats.totalUsers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Пользователей
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SportsSoccer color="success" sx={{ fontSize: 40 }} />
                  <div>
                    <Typography variant="h4">{stats.totalMatches}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Матчей
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="info" sx={{ fontSize: 40 }} />
                  <div>
                    <Typography variant="h4">{stats.totalPlaces}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Площадок
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Report color="warning" sx={{ fontSize: 40 }} />
                  <div>
                    <Typography variant="h4">{stats.pendingComplaints}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Жалоб
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Вкладки */}
        <Paper>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Пользователи" />
            <Tab label="Матчи" />
            <Tab label="Площадки" />
            <Tab label="Жалобы" />
          </Tabs>

          {/* Пользователи */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Роли</TableCell>
                    <TableCell>Дата регистрации</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(user.status)}
                          color={STATUS_COLORS[user.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.roles.join(', ')}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDialogType('block');
                            setSelectedItem(user);
                            setDialogOpen(true);
                          }}
                        >
                          <Block />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDialogType('delete');
                            setSelectedItem(user);
                            setDialogOpen(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TabPanel>

          {/* Матчи */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Организатор</TableCell>
                    <TableCell>Вид спорта</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Участники</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>{match.title}</TableCell>
                      <TableCell>{match.organizerName || match.organizerId}</TableCell>
                      <TableCell>{match.sport}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(match.status)}
                          color={STATUS_COLORS[match.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{match.participantsCount}</TableCell>
                      <TableCell>{new Date(match.scheduledAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell align="right">
                        {match.status !== 'CANCELLED' && match.status !== 'FINISHED' && (
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => {
                              setDialogType('cancel');
                              setSelectedItem(match);
                              setDialogOpen(true);
                            }}
                          >
                            <Warning />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDialogType('delete');
                            setSelectedItem(match);
                            setDialogOpen(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TabPanel>

          {/* Площадки */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Адрес</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата добавления</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {places.map((place) => (
                    <TableRow key={place.id}>
                      <TableCell>{place.name}</TableCell>
                      <TableCell>{place.address}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(place.placeType)}
                          color={STATUS_COLORS[place.placeType]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(place.status)}
                          color={STATUS_COLORS[place.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(place.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell align="right">
                        {place.status === 'PENDING' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprovePlace(place.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRejectPlace(place.id)}
                            >
                              <Block />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDialogType('delete');
                            setSelectedItem(place);
                            setDialogOpen(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TabPanel>

          {/* Жалобы */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Тип</TableCell>
                    <TableCell>Заявитель</TableCell>
                    <TableCell>Нарушитель</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        <Chip
                          label={complaint.complaintType}
                          color="error"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{complaint.reporterName}</TableCell>
                      <TableCell>{complaint.targetName}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(complaint.status)}
                          color={STATUS_COLORS[complaint.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(complaint.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleResolveComplaint(complaint.id, 'ACCEPTED')}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleResolveComplaint(complaint.id, 'REJECTED')}
                        >
                          <Block />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TabPanel>
        </Paper>

        {/* Диалог подтверждения */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {dialogType === 'block' && 'Заблокировать пользователя?'}
            {dialogType === 'delete' && 'Удалить?'}
            {dialogType === 'cancel' && 'Отменить матч?'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {dialogType === 'block' && `Вы уверены, что хотите заблокировать ${selectedItem?.email}?`}
              {dialogType === 'delete' && 'Это действие нельзя отменить.'}
              {dialogType === 'cancel' && `Матч "${selectedItem?.title}" будет отменён.`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={() => {
                if (dialogType === 'block' && selectedItem) {
                  handleBlockUser(selectedItem.id);
                } else if (dialogType === 'delete' && selectedItem) {
                  if (selectedItem.email) {
                    handleDeleteUser(selectedItem.id);
                  } else if (selectedItem.title) {
                    handleCancelMatch(selectedItem.id);
                  }
                } else if (dialogType === 'cancel' && selectedItem) {
                  handleCancelMatch(selectedItem.id);
                }
                setDialogOpen(false);
              }}
              variant="contained"
              color="error"
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminPage;
