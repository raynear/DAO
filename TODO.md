- [x] apollo refresh
- [x] graphql query refresh안되는 문제 => fetchpolycy => cache에 대해 공부해봐야 함
- [x] graphql search
- [x] graphql pagination 적용
- [x] 단독 proposal view => route 적용, id로 proposal 읽어오기
- [x] author 붙이기
- [x] new proposal에서 empty check => https://www.npmjs.com/package/simple-react-validator#betweenminmaxtypeoptional 사용
- [x] edit proposal
  - [x] select item 삭제 버튼 추가
- [x] proposal에서 vote 기능
  - [x] proposal에서 voted 아니면 vote 버튼 보이도록
  - [x] proposal에서 author일 경우 publish 버튼 보이도록
  - [x] publish 기능 구현
  - [x] vote 기능 구현
- [x] navigation connect
  - [x] publish 이후 refresh
  - [x] vote 이후 refresh
  - [x] vote 이후 vote result view
  - [x] edit proposal 이후 해당 글 proposal로 이동
  - [x] proposal에서 publish되지 않았을때 edit 버튼 => edit proposal로 이동
- [x] EditProposal을 GQL과 분리
- [x] 회원
  - [x] 회원가입 페이지
  - [x] Logout
  - [x] Sign 후 refresh
  - [x] 인증 페이지
  - [x] 인증 부분 score 작성해서 테스트
  - [x] Login 안된 상태에서 에러 fix
- [ ] management page
  - [ ] P-Rep용
    - [ ] writen proposals
    - [ ] edit proposal
    - [ ] publish proposal
  - [ ] 일반 사용자 용
    - [ ] voted proposals
    - [ ] delegated p-rep list
