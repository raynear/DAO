import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

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
/*
const SET_SELECTITEM = gql`
mutation NewSelectitem($proposalID:String!, $contents:String!){
  newSelectitem(proposalID: $proposalID, contents: $contents) {
    selectItem {
      id
    }
  }
}
`;
*/

interface Board {
  id: string;
  name: string;
}
interface Comment {
  subject: string;
  contents: string;
}

function ProposalForm() {
  const [selectItems, setSelectItems] = useState([{ id: 0, value: "" }, { id: 1, value: "" }]);
  const [values, setValues] = useState<Comment>({ subject: "", contents: "" })

  const [addProposal] = useMutation(SET_PROPOSAL);

  const { loading, error, data } = useQuery(GET_BOARDS);

  const addSelectItem = () => {
    setSelectItems([
      ...selectItems,
      {
        id: selectItems.length,
        value: ""
      }
    ]);
  };

  useEffect(() => {
    console.log(selectItems);
  });

  //function handleChange(event: React.FormEvent<HTMLInputElement>) {
  //  selectItems[parseInt(event.currentTarget.name)] = { id: parseInt(event.currentTarget.name), value: selectItems[parseInt(event.currentTarget.name)].value + event.currentTarget.value };
  //  setSelectItems(selectItems);
  //}

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setValues(oldValues => ({
      ...oldValues,
      [event.target.name as string]: event.target.value,
    }));
  };


  const handleProposalChange = (name: keyof Comment) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [name]: event.target.value });
  };

  function submitProposal() {
    addProposal({ variables: { subject: values.subject, contents: values.contents, boardID: "1", expireAt: "2019-11-05T00:00:00+00:00" } });
  }

  return (
    <div>
      <form>
        <TextField id="subject" label="Subject" value={values.subject} onChange={handleProposalChange('subject')} margin="normal" />
        <TextField id="content" label="contents" value={values.contents} onChange={handleProposalChange('contents')} multiline rows="10" placeholder="Proposal Contents" margin="normal" />
        <FormControl>
          <InputLabel>Board</InputLabel>
          <Select onChange={handleChange}>
            {!loading && !error && (data.allBoard.map((item: Board) => {
              return (
                <MenuItem value={item.name}></MenuItem>
              )
            }))}
          </Select>
        </FormControl>
        <Button color="primary" onClick={addSelectItem}>Add new select item</Button>
        {
          selectItems.map((item) => {
            //let selectLabel = "" + item.id;
            return (
              <Fragment key={item.id}>
                <TextField id={String(item.id)} label={String(item.id + 1)} name={String(item.id)} value={item.value} /> <br />
              </Fragment>
            )
          })
        }
        <Button color="primary" onClick={submitProposal}>Submit</Button>
      </form>
    </div >
  );
}

export default ProposalForm;