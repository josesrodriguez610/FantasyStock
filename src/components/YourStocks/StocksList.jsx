/* eslint-disable react/prop-types */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableCell,
  TableRow,
  TextField
} from '@material-ui/core';
import React, { useState } from 'react';
// import WaiversPopUp from './WaiversPopUp.jsx';

function StocksList({ row, index }) {
  const [open, setOpen] = useState(false);
  const [myStocks, setMyStocks] = useState({});

  const handleOpen = () => {
    setMyStocks(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TableRow
        className='basicTable_row'
        hover
        role='checkbox'
        tabIndex={-1}
        key={index}
      >
        <TableCell padding='checkbox' />
        <TableCell onClick={handleOpen} component='th' id={index} scope='row' padding='none'>
          {row.ticker}
        </TableCell>
        <TableCell align='right'>{row.company_name}</TableCell>
        <TableCell align='right'>{row.price_per_share_at_purchase}</TableCell>
        <TableCell align='right'>{row.shares}</TableCell>
        <TableCell align='right'>{row.protein}</TableCell>
      </TableRow>
      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Stock Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {myStocks.name}
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='something'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='something'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='something'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='something'
            type='email'
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleClose} color='primary'>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StocksList;
