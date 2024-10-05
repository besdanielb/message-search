import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { COLORS } from '../constants';

export default function QuickSearchToolbar(props) {

  return (
    <GridToolbarContainer sx={{':focus': {borderBottom: '3px solid white'}}}>
      <GridToolbarQuickFilter
        value={props.value}
        onChange={props.onChange}
        variant="standard"
        placeholder="Search by Message title or date"
        sx={{ margin: '0.1em 0.3em' , width: "90%"}}
      />
      {props.value && (
        <Button onClick={props.clearSearch} sx={{ marginLeft: '1em', color: COLORS.midGray }}>
          Clear
        </Button>
      )}
    </GridToolbarContainer>
  );
}