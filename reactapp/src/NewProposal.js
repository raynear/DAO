import React, { useState, useEffect } from 'react';
//import { Fragment } from 'react';
//import gql from 'graphql-tag';
//import { useQuery } from '@apollo/react-hooks';
import { Form, Input, Button/*, Tooltip, Icon, Select, Row, Col*/ } from 'antd';
const { TextArea } = Input;
/*
const SET_PROPOSAL = gql`
  mutation {
  }
`;
*/

/*
mutation {
  newSelectitem(proposalID: "5", contents: "44444444444") {
    selectItem {
      id
    }
  }
}

mutation {
  newProposal(subject:"새로운 Proposal", contents:"이것이야말로 새로운 프로포절을 보내는 테스트이다", boardID:"1", expireAt:"2019-10-20T01:54:56+00:00"){
    proposal{
      id
      subject
      contents
    }
  }
}
*/

function ProposalForm() {
  const [selectItems, setSelectItems] = useState([{ id: 0, value: "" }, { id: 1, value: "" }]);

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

  return (
    <Form>
      <Form.Item label="Subject">
        <Input />
      </Form.Item>
      <TextArea label="contents" placeholder="Proposal Contents" />
      <Button type="primary" block onClick={addSelectItem}>Add new select item</Button>
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
    </Form>
  );
}

export default ProposalForm;