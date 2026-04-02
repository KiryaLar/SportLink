import React, { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  CheckCircleOutline as ApproveIcon,
  Close as RejectIcon,
  People as UsersIcon,
  SportsSoccer as MatchesIcon,
  LocationOn as PlacesIcon,
  Flag as ComplaintsIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getUsers, blockUser, unblockUser, deleteUser,
  getAdminMatches, cancelMatch, deleteAdminMatch,
  getAdminPlaces, approvePlace, rejectPlace,
  getComplaints, resolveComplaint, rejectComplaint,
  getStatistics,
} from '../api/admin.api'
import ConfirmDialog from '../components/common/ConfirmDialog'

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null
  return <Box sx={{ pt: 3 }}>{children}</Box>
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState(0)
  const [usersPage, setUsersPage] = useState(0)
  const [matchesPage, setMatchesPage] = useState(0)
  const [placesPage, setPlacesPage] = useState(0)
  const [complaintsPage, setComplaintsPage] = useState(0)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
    dangerous?: boolean
  }>({ open: false, title: '', message: '', onConfirm: () => {} })
  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getStatistics,
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', usersPage],
    queryFn: () => getUsers({ page: usersPage, size: 20 }),
    enabled: tab === 1,
  })

  const { data: adminMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ['admin', 'matches', matchesPage],
    queryFn: () => getAdminMatches({ page: matchesPage, size: 20 }),
    enabled: tab === 2,
  })

  const { data: adminPlaces, isLoading: placesLoading } = useQuery({
    queryKey: ['admin', 'places', placesPage],
    queryFn: () => getAdminPlaces({ page: placesPage, size: 20 }),
    enabled: tab === 3,
  })

  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['admin', 'complaints', complaintsPage],
    queryFn: () => getComplaints({ page: complaintsPage, size: 20 }),
    enabled: tab === 4,
  })

  const confirm = (title: string, message: string, onConfirm: () => void, dangerous = false) => {
    setConfirmState({ open: true, title, message, onConfirm, dangerous })
  }

  // User mutations
  const blockMutation = useMutation({
    mutationFn: (id: string) => blockUser(id),
    onSuccess: () => { toast.success('Пользователь заблокирован'); queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const unblockMutation = useMutation({
    mutationFn: (id: string) => unblockUser(id),
    onSuccess: () => { toast.success('Пользователь разблокирован'); queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => { toast.success('Пользователь удалён'); queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }) },
    onError: () => toast.error('Ошибка'),
  })

  // Match mutations
  const cancelMatchMutation = useMutation({
    mutationFn: (id: string) => cancelMatch(id),
    onSuccess: () => { toast.success('Матч отменён'); queryClient.invalidateQueries({ queryKey: ['admin', 'matches'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const deleteMatchMutation = useMutation({
    mutationFn: (id: string) => deleteAdminMatch(id),
    onSuccess: () => { toast.success('Матч удалён'); queryClient.invalidateQueries({ queryKey: ['admin', 'matches'] }) },
    onError: () => toast.error('Ошибка'),
  })

  // Place mutations
  const approvePlaceMutation = useMutation({
    mutationFn: (id: string) => approvePlace(id),
    onSuccess: () => { toast.success('Площадка одобрена'); queryClient.invalidateQueries({ queryKey: ['admin', 'places'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const rejectPlaceMutation = useMutation({
    mutationFn: (id: string) => rejectPlace(id),
    onSuccess: () => { toast.success('Площадка отклонена'); queryClient.invalidateQueries({ queryKey: ['admin', 'places'] }) },
    onError: () => toast.error('Ошибка'),
  })

  // Complaint mutations
  const resolveComplaintMutation = useMutation({
    mutationFn: (id: string) => resolveComplaint(id),
    onSuccess: () => { toast.success('Жалоба решена'); queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const rejectComplaintMutation = useMutation({
    mutationFn: (id: string) => rejectComplaint(id),
    onSuccess: () => { toast.success('Жалоба отклонена'); queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] }) },
    onError: () => toast.error('Ошибка'),
  })

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Администрирование
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<StatsIcon />} iconPosition="start" label="Статистика" />
          <Tab icon={<UsersIcon />} iconPosition="start" label="Пользователи" />
          <Tab icon={<MatchesIcon />} iconPosition="start" label="Матчи" />
          <Tab icon={<PlacesIcon />} iconPosition="start" label="Площадки" />
          <Tab icon={<ComplaintsIcon />} iconPosition="start" label="Жалобы" />
        </Tabs>
      </Box>

      {/* Stats */}
      <TabPanel value={tab} index={0}>
        {statsLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton height={90} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : stats ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard icon={<UsersIcon />} label="Всего пользователей" value={stats.totalUsers} color="#4361EE" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard icon={<UsersIcon />} label="Активных пользователей" value={stats.activeUsers} color="#22C55E" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard icon={<MatchesIcon />} label="Всего матчей" value={stats.totalMatches} color="#F59E0B" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard icon={<PlacesIcon />} label="Всего площадок" value={stats.totalPlaces} color="#38BDF8" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard icon={<ComplaintsIcon />} label="Ожидают рассмотрения" value={stats.pendingComplaints} color="#EF4444" />
            </Grid>
          </Grid>
        ) : null}
      </TabPanel>

      {/* Users */}
      <TabPanel value={tab} index={1}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : (users?.content ?? []).map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.status === 'ACTIVE' ? 'Активен' : 'Заблокирован'}
                          color={u.status === 'ACTIVE' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell align="right">
                        {u.status === 'ACTIVE' ? (
                          <Tooltip title="Заблокировать">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => confirm('Заблокировать?', `Заблокировать пользователя ${u.name}?`, () => blockMutation.mutate(u.id))}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Разблокировать">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => unblockMutation.mutate(u.id)}
                            >
                              <UnblockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => confirm('Удалить пользователя?', `Это действие нельзя отменить.`, () => deleteUserMutation.mutate(u.id), true)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={users?.totalElements ?? 0}
            page={usersPage}
            onPageChange={(_, p) => setUsersPage(p)}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </TableContainer>
      </TabPanel>

      {/* Matches */}
      <TabPanel value={tab} index={2}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Спорт</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchesLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                : (adminMatches?.content ?? []).map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{m.title}</TableCell>
                      <TableCell>{m.sport}</TableCell>
                      <TableCell>
                        <Chip label={m.status} size="small" />
                      </TableCell>
                      <TableCell>{new Date(m.scheduledAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell align="right">
                        {m.status !== 'CANCELLED' && m.status !== 'FINISHED' && (
                          <Tooltip title="Отменить">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => confirm('Отменить матч?', 'Отменить матч для всех участников?', () => cancelMatchMutation.mutate(m.id))}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => confirm('Удалить матч?', 'Удалить матч безвозвратно?', () => deleteMatchMutation.mutate(m.id), true)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={adminMatches?.totalElements ?? 0}
            page={matchesPage}
            onPageChange={(_, p) => setMatchesPage(p)}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </TableContainer>
      </TabPanel>

      {/* Places */}
      <TabPanel value={tab} index={3}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Адрес</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {placesLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                : (adminPlaces?.content ?? []).map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.address}</TableCell>
                      <TableCell>
                        <Chip label={p.placeType === 'FREE' ? 'Бесплатно' : 'Платно'} size="small" color={p.placeType === 'FREE' ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell>
                        <Chip label={p.status} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        {p.status === 'PENDING' && (
                          <>
                            <Tooltip title="Одобрить">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => approvePlaceMutation.mutate(p.id)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Отклонить">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => rejectPlaceMutation.mutate(p.id)}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={adminPlaces?.totalElements ?? 0}
            page={placesPage}
            onPageChange={(_, p) => setPlacesPage(p)}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </TableContainer>
      </TabPanel>

      {/* Complaints */}
      <TabPanel value={tab} index={4}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Текст</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaintsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                : (complaints?.content ?? []).map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Chip label={c.complaintType} size="small" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap title={c.complaintText}>
                          {c.complaintText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.status}
                          size="small"
                          color={c.status === 'PENDING' ? 'warning' : c.status === 'RESOLVED' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell align="right">
                        {c.status === 'PENDING' && (
                          <>
                            <Tooltip title="Принять">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => resolveComplaintMutation.mutate(c.id)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Отклонить">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => rejectComplaintMutation.mutate(c.id)}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={complaints?.totalElements ?? 0}
            page={complaintsPage}
            onPageChange={(_, p) => setComplaintsPage(p)}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </TableContainer>
      </TabPanel>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Подтвердить"
        onConfirm={() => {
          confirmState.onConfirm()
          setConfirmState((s) => ({ ...s, open: false }))
        }}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
        dangerous={confirmState.dangerous}
      />
    </Box>
  )
}
