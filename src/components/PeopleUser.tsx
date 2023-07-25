import React from "react";

import { FirstNameProp, LastNameProp } from "../interfaces";

interface Props {
  userFirstName: FirstNameProp["firstName"];
  userLastName: LastNameProp["lastName"];
}

function PeopleUser(props: Props) {
  const { userFirstName, userLastName } = props;

  return (
    <div className="grid grid-cols-[1fr,1fr,1fr] gap-[25px] pt-6 items-center">
      <div>Profile Picture</div>
      <div className="flex">
        <div>
          {userFirstName} {userLastName}
        </div>
      </div>
      <button className="cursor-pointer bg-[#00A7E1] text-white">Add Friend</button>
    </div>
  );
}

export default PeopleUser;
