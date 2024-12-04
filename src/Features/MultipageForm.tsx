import { useState, useEffect } from "react";
import { useFetchFormQuery } from "../Redux/formApi";
import { useAppDispatch } from "../Redux/hooks";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";
import { updatePage1, updatePage2, updatePage3 } from '../Redux/formSlice';


const MultiPageForm: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFetchFormQuery();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) {
      dispatch(updatePage1(data.page1));
      dispatch(updatePage2(data.page2));
      dispatch(updatePage3(data.page3));
    }
  }, [data, dispatch]);

  if (isLoading && !data) return <div>Loading...</div>;

  return (
    <div>
      {page === 1 && <Page1 onNext={() => setPage(2)} />}
      {page === 2 && <Page2 onNext={() => setPage(3)} onBack={() => setPage(1)} />}
      {page === 3 && <Page3 onBack={() => setPage(2)} onSubmitFinal={() => setPage(4)} />}
    </div>
  );
};

export default MultiPageForm;
