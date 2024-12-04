import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { updatePage2 } from '../Redux/formSlice';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';


interface Page2Form {
  age: number;
  gender: string;
}

const Page2: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const dispatch = useAppDispatch();
  const page2Data = useAppSelector((state) => state.form.page2);

  const { register, handleSubmit } = useForm<Page2Form>({
    defaultValues: page2Data,
  });

  const onSubmit: SubmitHandler<Page2Form> = (data) => {
    dispatch(updatePage2(data));
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Age:</label>
        <input type="number" {...register('age')} />
      </div>
      <div>
        <label>Gender:</label>
        <select {...register('gender')}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <button type="button" onClick={onBack}>Back</button>
      <button type="submit">Next</button>
    </form>
  );
};

export default Page2;
