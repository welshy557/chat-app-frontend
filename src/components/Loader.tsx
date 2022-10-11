import { Grid } from "react-loader-spinner";
import "../index.css";
const Loader = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <div className="loader">
      <Grid color="#1982FC" height={100} width={200} />
    </div>
  ) : (
    <></>
  );
};

export default Loader;
