import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { TextField, Button } from '@material-ui/core';
const SET_PROPOSAL = gql`
mutation NewProposal($subject:String!, $contents:String!, $boardID:String!, $expired_at:String!){
  newProposal(subject:$subject, contents:$contents, boardID:$boardID, expired_at:$expired_at){
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

interface Comment {
  subject: string;
  contents: string;
}

function ProposalForm() {
  const [selectItems, setSelectItems] = useState([{ id: 0, value: "" }, { id: 1, value: "" }]);
  const [values, setValues] = useState<Comment>({ subject: "", contents: "" })

  const [addProposal] = useMutation(SET_PROPOSAL);

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

  //  function handleChange(event: React.FormEvent<HTMLInputElement>) {
  //    selectItems[parseInt(event.currentTarget.name)] = { id: parseInt(event.currentTarget.name), value: selectItems[parseInt(event.currentTarget.name)].value + event.currentTarget.value };
  //    setSelectItems(selectItems);
  //  }

  const handleChange = (name: keyof Comment) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [name]: event.target.value });
  };

  function submitProposal() {
    addProposal({ variables: { $subject: "test", $contents: "contents test" } });
  }

  return (
    <div>
      <form>
        <TextField id="subject" label="Subject" value={values.subject} onChange={handleChange('subject')} margin="normal" />
        <TextField id="content" label="contents" value={values.contents} onChange={handleChange('contents')} multiline rows="10" placeholder="Proposal Contents" margin="normal" />
        <Button color="primary" onClick={addSelectItem}>Add new select item</Button>
        {
          selectItems.map((item) => {
            //let selectLabel = "" + item.id;
            return (
              <Fragment>
                <TextField id={String(item.id)} label={String(item.id + 1)} name={String(item.id)} value={item.value} /> <br />
              </Fragment>
            )
          })
        }
        <Button color="primary" onClick={submitProposal}>Submit</Button>
      </form>
    </div>
  );
}

export default ProposalForm;