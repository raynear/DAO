import React from 'react';
import { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const GET_PROPOSALS = gql`
  query {
    allProposal {
      subject
      contents
      selectitemmodelSet {
        contents
      }
    }
  }
`;

function Proposals() {
  const { loading, error, data } = useQuery(GET_PROPOSALS);
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error!:{error}</p>);
  return (
    <div>
      {data.allProposal.map(({ id, subject, contents, selectitemmodelSet }) => (
        <div key={id}>
          <h3>{subject}</h3>
          <h4>{contents}</h4>
          <form>
            {selectitemmodelSet.map(({ id, contents }) => (
              <Fragment>
                <input key={id} type="radio" name="test" value={contents} /> {contents}<br />
              </Fragment>
            ))}
          </form>
        </div>
      ))}
    </div>
  );
}

export default Proposals;