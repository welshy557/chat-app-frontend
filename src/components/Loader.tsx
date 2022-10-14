import { Grid } from "react-loader-spinner";
import "../index.css";
const Loader = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="loaderContainer">
      <Grid
        color="#1982FC"
        height={100}
        width={200}
        visible={isLoading}
        wrapperClass="loader"
      />
    </div>
  );
};

export default Loader;
