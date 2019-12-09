import React, { Fragment, useState } from "react";
import { Typography } from "@material-ui/core";
import { Redirect } from "react-router-dom";

import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { GET_PROPOSAL_N_PREP, SET_PROPOSAL, GET_LOCAL_ME } from "./GQL";
import SimpleReactValidator from "simple-react-validator";

import useForceUpdate from "./useForceUpdate";
import EditProposal from "./EditProposal";

const validator = new SimpleReactValidator({
  locale: "en",
  className: "text-danger",
  element: (message: any, className: any) => (
    <Typography variant="caption" color="error" className={className}>
      {message}
    </Typography>
  )
});

function EditProposalContainer(props: any) {
  console.log("EditProposalContainer props", props);

  //  const match = props.match;
  //  const history = props.history;
  //  const location = props.location;
  //  const prop_proposal = props.proposal;

  let proposal_id: any;
  if (props && props.match && props.match.params && props.match.params.proposal_id) {
    proposal_id = props.match.params.proposal_id;
  } else {
    proposal_id = -1;
  }

  const client = useApolloClient();
  const forceUpdate = useForceUpdate();

  const [username, setUsername] = useState("");
  const [redirect, setRedirect] = useState();

  const [selectItems, setSelectItems] = useState(["", "", "", ""]);
  const [values, setValues] = useState({
    id: -1,
    quorumRate: 50,
    tokenRate: 50,
    prepId: 0,
    subject: "",
    contents: "",
    expireAt: new Date("2019-12-18T21:11:54"),
    selectitemmodelSet: []
  });

  const [mutateProposal] = useMutation(SET_PROPOSAL);

  const addSelectItem = () => {
    setSelectItems([...selectItems, ""]);
  };

  const handleSelectItemChange = (index: number) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectItems([
      ...selectItems.slice(0, index),
      event.target.value,
      ...selectItems.slice(index + 1)
    ]);
  };

  function deleteSelectItem(index: number) {
    let tmp = selectItems;
    tmp.splice(index, 1);
    setSelectItems(tmp);
    forceUpdate();
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setValues({ ...values, expireAt: date });
    }
  };

  const handleProposalChange = (name: string) => (
    event: React.ChangeEvent<any>
  ) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleSliderChange = (name: string) => (event: any, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setValues({ ...values, [name]: newValue[0] });
    }
    else {
      setValues({ ...values, [name]: newValue });
    }
  };

  function handlesubmitProposal() {
    if (!validator.allValid()) {
      validator.showMessages();
      forceUpdate();
      return;
    }

    let tmpSelectItemList: { index: Number; contents: String }[] = [];
    selectItems.map((item: any, idx: any) => {
      tmpSelectItemList.push({
        index: idx,
        contents: item
      });
      //await mutateSelectItem({ variables: { proposalID: newProposalID, contents: item.value } });
      return item;
    });

    let mutate_var: { [index: string]: any } = {
      variables: {
        proposalId: values.id,
        subject: values.subject,
        contents: values.contents,
        published: false,
        prepId: values.prepId,
        quorumRate: values.quorumRate,
        tokenRate: values.tokenRate,
        expireAt: values.expireAt.toISOString(),
        selectItemList: tmpSelectItemList
      }
    };

    console.log("send mutate_var", mutate_var);
    submitProposal(mutate_var);
    console.log("aAAAAAAAAAAAAAAAAAAAAAAA");
  }

  client.query({ query: GET_LOCAL_ME }).then((result) => {
    console.log("get local me", result);
    try {
      setUsername(result.data.username);
    } catch {
      setUsername("");
    }
  })

  function submitProposal(mutate_var: any) {
    console.log("submitProposal mutate_var:", mutate_var);
    mutateProposal(mutate_var).then(result => {
      setRedirect(result.data.setProposal.proposal.id);
    });
  }

  function renderRedirect() {
    if (redirect) {
      return <Redirect to={"/Proposal/" + redirect} />;
    }
  }


  const queryVal = useQuery(GET_PROPOSAL_N_PREP, {
    variables: { id: proposal_id, PRepName: username }
  })
  if (queryVal.data && queryVal.data.proposal) {

    let proposal = queryVal.data.proposal;
    setValues({
      id: -1,
      quorumRate: 50,
      tokenRate: 50,
      prepId: 0,
      subject: "",
      contents: "",
      expireAt: new Date("2019-12-18T21:11:54"),
      selectitemmodelSet: []
    });

    let tmpSelectItems: string[] = [];
    proposal.selectitemmodelSet.map((item: any) => {
      tmpSelectItems.push(item.contents);
      return item;
    });
    if (tmpSelectItems.length > 0) {
      setSelectItems(tmpSelectItems);
    }
  }

  return (
    <Fragment>
      {renderRedirect()}
      <EditProposal
        {...queryVal}
        values={values}
        setValues={setValues}
        addSelectItem={addSelectItem}
        handleSelectItemChange={handleSelectItemChange}
        deleteSelectItem={deleteSelectItem}
        handleDateChange={handleDateChange}
        handleProposalChange={handleProposalChange}
        handleSliderChange={handleSliderChange}
        handlesubmitProposal={handlesubmitProposal}
      />
    </Fragment>
  );
}

export default EditProposalContainer;