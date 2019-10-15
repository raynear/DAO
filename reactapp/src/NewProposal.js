import React, { useState, useEffect } from 'react';
//import { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Form, Input, Button/*, Tooltip, Icon, Select, Row, Col*/ } from 'antd';
const { TextArea } = Input;
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

function ProposalForm() {
  const [selectItems, setSelectItems] = useState([{ id: 0, value: "" }, { id: 1, value: "" }]);

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

  function handleChange(event) {
    selectItems[parseInt(event.target.name)] = { id: parseInt(event.target.name), value: selectItems[parseInt(event.target.name)].value + event.target.value };
    setSelectItems(selectItems);
  }

  function submitProposal() {
    addProposal({ variables: { $subject: "test", $contents: "contents test" } });
  }

  return (
    <Form>
      <Form.Item label="Subject">
        <Input />
      </Form.Item>
      <TextArea label="contents" placeholder="Proposal Contents" />
      <Button type="secondary" block onClick={addSelectItem}>Add new select item</Button>
      {
        selectItems.map((item) => {
          //let selectLabel = "" + item.id;
          return (
            <Form.Item key={item.id} label={String(parseInt(item.id) + 1)} >
              <Input name={item.id} value={item.value} onChange={handleChange} />
            </Form.Item>
          )
        })
      }
      <Button type="primary" block onClick={submitProposal}>Submit</Button>
    </Form>
  );
}

export default ProposalForm;