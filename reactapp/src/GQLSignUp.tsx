import React, { Fragment } from "react";
import { withRouter } from "react-router-dom";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { GET_LOCAL_ME, SET_USER, TOKEN_AUTH } from "./GQL";

import Cookies from "js-cookie";

import SignUp from "./SignUp";

function GQLSignUp(props: any) {
  const client = useApolloClient();

  //  const [redirect, setRedirect] = useState();
  const [mutateSignup] = useMutation(SET_USER);
  const [mutateTokenAuth] = useMutation(TOKEN_AUTH);

  // function renderRedirect() {
  //   if (redirect) {
  //     return <Redirect to={redirect} />;
  //   }
  // }

  async function NewUser(username: string, password: string) {
    try {
      await mutateSignup({
        variables: { username: username, password: password }
      })
    }
    catch (e) {
      if (e.toString().indexOf("UNIQUE")) {
        alert("id exist. make another id")
      }
      return false;
    }
    return true;
    /*.then(result => {
      console.log(result);
    }).catch(e => {
      console.log("error?", e);
      if (e.toString().indexOf("UNIQUE")) {
        alert("id exist. make another id")
        return false;
      }
    });*/
  }


  function LogIn(username: string, password: string) {
    mutateTokenAuth({
      variables: { username: username, password: password }
    }).then(result => {
      console.log(result);
      client.writeData({
        data: {
          username: username
        }
      });
      Cookies.set("JWT", result.data.tokenAuth.token);
    });
  }

  const { loading, error, data } = useQuery(GET_LOCAL_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!:</p>;
  console.log("GQLSign2", data);
  return (
    <Fragment>
      {/* {renderRedirect()} */}
      <SignUp NewUser={NewUser} LogIn={LogIn} />
    </Fragment>
  );
  /*
    const { loading, data } = useQuery(GET_ME);
  
    if (loading) return <p>Loading...</p>;
    //  if (error) return <p>Error!:</p>;
    if (data && data.me) {
      client.writeData({
        data: {
          username: data.me.username,
          email: data.me.email
          //photo:data.me.socialAuth.edges[0].node.extraData.properties.thumbnailImage
        }
      });
    }
    console.log("GQLSign2", data);
    return (
      <Fragment>
        {renderRedirect()}
        <SignUp match={match} NewUser={NewUser} LogIn={LogIn} />
      </Fragment>
    );
  */
}

export default withRouter(GQLSignUp);
