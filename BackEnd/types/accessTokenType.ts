import { JwtPayload } from "jsonwebtoken"

interface accessTokenData extends JwtPayload{ //make tokenData like JwtPayload as we will assign later to first below. As JwtPayload have other fields as well other than our custom fields so we need to inherit those.
    id: string,
    name: string,
    email: string,
};

export default accessTokenData;