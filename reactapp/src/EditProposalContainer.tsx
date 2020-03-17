import React, { Fragment, useState } from "react";
import { Typography } from "@material-ui/core";
import { Redirect } from "react-router-dom";

import { useQuery, useMutation } from "@apollo/react-hooks";
import { GET_PROPOSAL4EDIT, SET_PROPOSAL } from "./GQL";
import SimpleReactValidator from "simple-react-validator";

import useForceUpdate from "./useForceUpdate";
import EditProposal from "./EditProposal";

function EditProposalContainer(props: any) {
  // console.log("EditProposalContainer props", props);

  //  const match = props.match;
  //  const history = props.history;
  //  const location = props.location;
  //  const prop_proposal = props.proposal;

  let proposal_id: any;
  if (
    props &&
    props.match &&
    props.match.params &&
    props.match.params.proposal_id
  ) {
    proposal_id = props.match.params.proposal_id;
  } else {
    proposal_id = -1;
  }

  const forceUpdate = useForceUpdate();

  const [redirect, setRedirect] = useState();

  const [selectItems, setSelectItems] = useState(["", "", "", ""]);
  const [values, setValues] = useState({
    id: -1,
    isPublicVote: false,
    electoralTh: 50,
    winningTh: 50,
    subject: "",
    contents: "",
    days: 5,
    hours: 0,
    expireAt: new Date(),
    selectitemmodelSet: []
  });

  const [mutateProposal] = useMutation(SET_PROPOSAL);

  const [validator] = useState(
    new SimpleReactValidator({
      validators: {
        diff: {
          message: "input different options.",
          rule: (val: any, params: any) => {
            // console.log(val, params);
            for (let i = 0; i < val.length; i++) {
              for (let j = i + 1; j < val.length; j++) {
                if (val[i] === val[j]) {
                  return false;
                }
              }
            }
            return true;
          }
        },
        listFilled: {
          message: "input every field",
          rule: (val: any, params: any) => {
            if (val[parseInt(params[0])] === "") {
              return false;
            }
            return true;
          }
        }
      },
      locale: "en",
      className: "text-danger",
      element: (message: any, className: any) => (
        <Typography variant="caption" color="error" className={className}>
          {message}
        </Typography>
      )
    })
  );

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

  function toggleVoteType() {
    setValues({ ...values, isPublicVote: !values.isPublicVote });
  }

  const handleDateChange = (days: number) => {
    // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    var today = new Date();
    var dueto = new Date();
    dueto.setDate(today.getDate() + 1);
    // console.log(dueto);
    setValues({ ...values, expireAt: dueto });
  };

  const handleProposalChange = (name: string) => (
    event: React.ChangeEvent<any>
  ) => {
    // console.log("~~~~~~~~~~~~~~~~~~~~~", name, event.target.value, parseInt(event.target.value))

    if (name === "days" || name === "hours") {
      if (event.target.value !== "") {
        var today = new Date();
        if (name === "days") {
          today.setDate(today.getDate() + parseInt(event.target.value));
          today.setHours(today.getHours() + values.hours);
        } else {
          today.setDate(today.getDate() + values.days);
          today.setHours(today.getHours() + parseInt(event.target.value));
        }
        // console.log(today.toString());
        setValues({
          ...values,
          [name]: parseInt(event.target.value),
          expireAt: today
        });
      }
    } else {
      setValues({ ...values, [name]: event.target.value });
    }
  };

  const handleSliderChange = (name: string) => (
    event: any,
    newValue: number | number[]
  ) => {
    if (Array.isArray(newValue)) {
      setValues({ ...values, [name]: newValue[0] });
    } else {
      setValues({ ...values, [name]: newValue });
    }
    // console.log(values);
  };

  function handleEditorChange(content: string) {
    setValues({ ...values, contents: content });
  }

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

    const mutate_var: { [index: string]: any } = {
      variables: {
        proposalId: values.id,
        isPublicVote: values.isPublicVote,
        subject: values.subject,
        contents: values.contents,
        published: false,
        electoralTh: values.electoralTh,
        winningTh: values.winningTh,
        expireAt: values.expireAt.toISOString(),
        selectItemList: tmpSelectItemList
      }
    };

    console.log("MUTATE_VAR", mutate_var);

    submitProposal(mutate_var);
  }

  function submitProposal(mutate_var: any) {
    // console.log("submitProposal mutate_var:", mutate_var);
    mutateProposal(mutate_var).then(result => {
      setRedirect(result.data.setProposal.proposal.id);
    });
  }

  function renderRedirect() {
    if (redirect) {
      return (
        <Redirect
          to={"/NoteProposal/" + queryVal.data.viewer.username + "/" + redirect}
        />
      );
    }
  }

  const queryVal = useQuery(GET_PROPOSAL4EDIT, {
    variables: { id: proposal_id }
  });

  if (queryVal.data && queryVal.data.proposal && values.id === -1) {
    const proposal = queryVal.data.proposal;
    const date = new Date(proposal.expireAt);
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / 1000;

    let dayDiff = 0;
    let hourDiff = 0;

    if (diff > 0) {
      dayDiff = Math.floor(diff / (60 * 60 * 24));
      hourDiff = Math.floor((diff - dayDiff * 60 * 60 * 24) / (60 * 60));
    }

    setValues({
      id: proposal.id,
      electoralTh: proposal.electoralTh,
      winningTh: proposal.winningTh,
      isPublicVote: proposal.isPublicVote,
      subject: proposal.subject,
      contents: proposal.contents,
      days: dayDiff,
      hours: hourDiff,
      expireAt: date,
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
        validator={validator}
        values={values}
        setValues={setValues}
        selectItems={selectItems}
        addSelectItem={addSelectItem}
        handleSelectItemChange={handleSelectItemChange}
        deleteSelectItem={deleteSelectItem}
        handleDateChange={handleDateChange}
        handleProposalChange={handleProposalChange}
        handleSliderChange={handleSliderChange}
        handleEditorChange={handleEditorChange}
        handlesubmitProposal={handlesubmitProposal}
        toggleVoteType={toggleVoteType}
      />
    </Fragment>
  );
}

export default EditProposalContainer;
