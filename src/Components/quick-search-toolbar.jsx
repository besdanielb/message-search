import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from '@mui/material/styles';
import { GridToolbarContainer } from '@mui/x-data-grid';

const StyledGridToolbarContainer = styled(GridToolbarContainer)(() => ({
  padding: 1,
  display: 'flex',
  justifyContent: 'flex-start',
}));

export default function QuickSearchToolbar(props) {
  const { value, onChange, clearSearch } = props;

  return (
    <StyledGridToolbarContainer>
      <TextField
        variant="standard"
        value={value}
        onChange={onChange}
        placeholder="Search…"
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: value ? (
            <IconButton
              aria-label="clear search"
              onClick={clearSearch}
              size="small"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null,
        }}
        sx={{ width: '25ch' }}
      />
    </StyledGridToolbarContainer>
  );
}