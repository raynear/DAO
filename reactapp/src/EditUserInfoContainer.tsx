import React, { useState } from "react";

import { Typography } from "@material-ui/core";
import SimpleReactValidator from "simple-react-validator";
import { SET_USER } from "./GQL";
import { useMutation } from "react-apollo";

import EditUserInfo from "./EditUserInfo";

function EditUserInfoContainer(props: any) {
  // console.log("ProfileContainer props", props);
  const [mutateSetUser] = useMutation(SET_USER);

  const [signInfo, setSignInfo] = useState({
    username: "",
    avatar: "",
    old_password: "",
    password: "",
    password2: ""
  });

  const [validator] = useState(new SimpleReactValidator({
    validators: {
      same: {
        message: "input same password.",
        rule: (val: any, params: any) => {
          // console.log(val, params, validator);
          for (let i = 0; i < val.length; i++) {
            for (let j = i + 1; j < val.length; j++) {
              if (val[i] !== val[j]) {
                return false;
              }
            }
          }
          return true;
        }
      },
      minpass: {
        message: "input more than :param character",
        rule: (val: any, params: any) => {
          if (val[0].length >= parseInt(params[0])) {
            return true;
          }
          return false;
        },
        messageReplace: (msg: any, params: any) => msg.replace(':param', validator.helpers.toSentence(params))
      }
    },
    locale: "en",
    className: "text-danger",
    element: (message: any, className: any) => (
      <Typography variant="caption" color="error" className={className}>
        {message}
      </Typography>
    )
  }));

  function sameValidate(val: any) {
    if (val[0] === val[1]) {
      return;
    } else {
      return (
        <Typography variant="caption" color="error">
          Have to be same.
        </Typography>
      );
    }
  }

  async function changeInfo() {
    try {
      await mutateSetUser({
        variables: { username: signInfo.username, password: signInfo.password, old_password: signInfo.old_password, avatar: signInfo.avatar }
      })
    }
    catch (e) {
      if (e.toString().indexOf("UNIQUE")) {
        alert("id exist. make another id")
      }
      return false;
    }
    return true;
  }

  function handleSignInfo(e: React.ChangeEvent<HTMLInputElement>) {
    setSignInfo({ ...signInfo, [e.target.name]: e.target.value });
  }

  return (<EditUserInfo
    signInfo={signInfo}
    handleSignInfo={handleSignInfo}
    validator={validator}
    changeInfo={changeInfo}
    sameValidate={sameValidate}
  />);
}

export default EditUserInfoContainer;