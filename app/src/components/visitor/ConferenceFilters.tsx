import React from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  InputAdornment,
  Paper
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Today as DayIcon,
  Room as RoomIcon,
  Person as SpeakerIcon
} from '@mui/icons-material'
import type { Room, ConferenceWithRegistration } from '../../lib/supabase'

interface ConferenceFiltersProps {
  selectedDay: number | null
  selectedRoom: number | null
  selectedSpeaker: string
  searchTerm: string
  
  rooms: Room[]
  conferences: ConferenceWithRegistration[]
  
  onDayChange: (day: number | null) => void
  onRoomChange: (roomId: number | null) => void
  onSpeakerChange: (speaker: string) => void
  onSearchChange: (search: string) => void
  onClearFilters: () => void
}

export const ConferenceFilters: React.FC<ConferenceFiltersProps> = ({
  selectedDay,
  selectedRoom,
  selectedSpeaker,
  searchTerm,
  rooms,
  conferences,
  onDayChange,
  onRoomChange,
  onSpeakerChange,
  onSearchChange,
  onClearFilters
}) => {
  const speakers = React.useMemo(() => {
    const uniqueSpeakers = Array.from(
      new Set(conferences.map(conf => conf.speaker?.name).filter(Boolean))
    ).sort()
    return uniqueSpeakers
  }, [conferences])

  const hasActiveFilters = selectedDay !== null || selectedRoom !== null || selectedSpeaker !== '' || searchTerm !== ''

  const handleDayTabChange = (_: React.SyntheticEvent, newValue: number | null) => {
    onDayChange(newValue)
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <DayIcon color="primary" />
            <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
              Filtrer par jour
            </InputLabel>
          </Box>
          <Tabs
            value={selectedDay}
            onChange={handleDayTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Tous les jours" value={null} />
            <Tab label="Jour 1" value={1} />
            <Tab label="Jour 2" value={2} />
            <Tab label="Jour 3" value={3} />
          </Tabs>
        </Box>

        <Box 
          display="flex" 
          gap={2} 
          flexDirection={{ xs: 'column', sm: 'row' }}
        >
          <FormControl fullWidth>
            <InputLabel>
              <Box display="flex" alignItems="center" gap={1}>
                <RoomIcon fontSize="small" />
                Salle
              </Box>
            </InputLabel>
            <Select
              value={selectedRoom || ''}
              onChange={(e) => onRoomChange(e.target.value ? Number(e.target.value) : null)}
              label="Salle"
            >
              <MenuItem value="">
                <em>Toutes les salles</em>
              </MenuItem>
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>
              <Box display="flex" alignItems="center" gap={1}>
                <SpeakerIcon fontSize="small" />
                Conférencier
              </Box>
            </InputLabel>
            <Select
              value={selectedSpeaker}
              onChange={(e) => onSpeakerChange(e.target.value)}
              label="Conférencier"
            >
              <MenuItem value="">
                <em>Tous les conférenciers</em>
              </MenuItem>
              {speakers.map((speaker) => (
                <MenuItem key={speaker} value={speaker}>
                  {speaker}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          placeholder="Rechercher dans les titres et descriptions..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment 
                position="end" 
                sx={{ cursor: 'pointer' }}
                onClick={() => onSearchChange('')}
              >
                <ClearIcon color="action" />
              </InputAdornment>
            )
          }}
        />

        {hasActiveFilters && (
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Filtres actifs :
            </span>
            
            {selectedDay && (
              <Chip
                label={`Jour ${selectedDay}`}
                size="small"
                onDelete={() => onDayChange(null)}
                color="primary"
              />
            )}
            
            {selectedRoom && (
              <Chip
                label={rooms.find(r => r.id === selectedRoom)?.name || 'Salle'}
                size="small"
                onDelete={() => onRoomChange(null)}
                color="secondary"
              />
            )}
            
            {selectedSpeaker && (
              <Chip
                label={selectedSpeaker}
                size="small"
                onDelete={() => onSpeakerChange('')}
                color="info"
              />
            )}
            
            {searchTerm && (
              <Chip
                label={`"${searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"`}
                size="small"
                onDelete={() => onSearchChange('')}
                color="warning"
              />
            )}

            <Chip
              label="Effacer tout"
              size="small"
              variant="outlined"
              onClick={onClearFilters}
              deleteIcon={<ClearIcon />}
              onDelete={onClearFilters}
            />
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default ConferenceFilters 