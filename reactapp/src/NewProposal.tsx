import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Paper, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import useStyles from './Style';

const GET_BOARDS = gql`
query {
  allBoard{
    id
    name
  }
}
`;

const SET_PROPOSAL = gql`
mutation NewProposal($subject:String!, $contents:String!, $boardID:String!, $expireAt:DateTime!){
  newProposal(subject:$subject, contents:$contents, boardID:$boardID, expireAt:$expireAt){
    proposal{
      id
      subject
      contents
    }
  }
}
`;


const SET_SELECTITEM = gql`
mutation NewSelectitem($proposalID:String!, $contents:String!){
  newSelectitem(proposalID: $proposalID, contents: $contents) {
    selectItem {
      id
    }
  }
}
`;


const SET_SELECTITEMLIST = gql`
mutation NewSelectItems($list:[SelectItemInput]){
  newSelectitem(inputList:$list) {
    selectItem {
      id
      contents
    }
  }
}
`;


interface Board {
  id: string;
  name: string;
}
interface Comment {
  subject: string;
  contents: string;
  board: string;
}

function ProposalForm() {
  const classes = useStyles();
  const [selectItems, setSelectItems] = useState([{ id: 0, value: "" }, { id: 1, value: "" }]);
  const [values, setValues] = useState<Comment>({ subject: "", contents: "", board: "" });
  const [boards, setBoards] = useState([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date('2019-10-18T21:11:54'),
  );

  const [mutateProposal] = useMutation(SET_PROPOSAL);
  const [mutateSelectItem] = useMutation(SET_SELECTITEM);
  const [mutateSelectItemList] = useMutation(SET_SELECTITEMLIST);

  const { loading, error, data } = useQuery(GET_BOARDS);
  if (!loading && !error && data && Array.isArray(boards) && boards.length === 0) {
    let aBoards = data.allBoard.map((item: Board) => ({ "id": item.id, "name": item.name }));
    setBoards(aBoards);
  }

  const addSelectItem = () => {
    setSelectItems([
      ...selectItems,
      {
        id: selectItems.length,
        value: ""
      }
    ]);
  };

  function handleSelectItemChange(index: number, value: string) {
    const tmpSelectItems = selectItems.map(l => Object.assign({}, l));
    tmpSelectItems.map((item, idx) => {
      if (idx === index) {
        tmpSelectItems[idx] = { id: idx, value: value };
      }
    });
    setSelectItems(tmpSelectItems);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleProposalChange = (name: keyof Comment) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleBoardChange = (name: keyof Comment) => (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setValues({ ...values, [name]: String(event.target.value) });
  };

  function submitProposal() {
    console.log({ subject: values.subject, contents: values.contents, boardID: values.board, expireAt: (selectedDate != null && selectedDate.toISOString()) });

    mutateProposal({ variables: { subject: values.subject, contents: values.contents, boardID: values.board, expireAt: ((selectedDate != null) ? selectedDate.toISOString() : "2019-10-05T09:00:00") } })
      .then((result) => {
        let newProposalID = result.data.newProposal.proposal.id;
        let tmpSelectItemList: { proposalID: String, contents: String }[] = [];
        selectItems.map((item) => {
          tmpSelectItemList.push({ proposalID: newProposalID, contents: item.value });
          //await mutateSelectItem({ variables: { proposalID: newProposalID, contents: item.value } });
        });
        console.log(tmpSelectItemList);
        mutateSelectItemList({ variables: { list: tmpSelectItemList } });
      })
  }

  return (
    <Grid item xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <form>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <FormControl>
                <InputLabel>Board</InputLabel>
                <Select value={values.board} onChange={handleBoardChange('board')}>
                  {(boards.length > 0) && boards.map((item: { id: string, name: string }) => {
                    return (
                      <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <TextField id="subject" label="Subject" value={values.subject} onChange={handleProposalChange('subject')} margin="normal" fullWidth />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <TextField id="content" label="Contents" value={values.contents} onChange={handleProposalChange('contents')} multiline rows="10" placeholder="Proposal Contents" margin="normal"  fullWidth/>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container justify="space-around">
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Date picker inline"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                  <KeyboardTimePicker
                    margin="normal"
                    variant="inline"
                    id="time-picker"
                    label="Time picker"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                      'aria-label': 'change time',
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <Button color="primary" onClick={addSelectItem}>Add new select item</Button>
            </Grid>
            {
              selectItems.map((item, idx) => {
                return (
                  <Grid key={idx} item xs={12} md={12} lg={12}>
                    <TextField id={String(item.id)} label={String(item.id + 1)} name={String(item.id)} value={item.value} onChange={(e) => { handleSelectItemChange(idx, e.target.value) }} fullWidth/> <br />
                  </Grid>
                )
              })
            }
            <Grid item xs={12} md={12} lg={12}>
              <Button color="primary" onClick={submitProposal}>Submit</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Grid>
  );
}

export default ProposalForm;