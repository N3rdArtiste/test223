import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSubmitFormMutation } from '../Redux/formApi';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import { updatePage3 } from '../Redux/formSlice';


interface Page3Form {
  address: string;
  city: string;
}

const Page3: React.FC<{ onBack: () => void; onSubmitFinal: () => void }> = ({ onBack, onSubmitFinal }) => {
  const dispatch = useAppDispatch();
  const page3Data = useAppSelector((state) => state.form.page3);
  const formData = useAppSelector((state) => state.form);
  const [submitForm, { isLoading }] = useSubmitFormMutation();

  const { register, handleSubmit } = useForm<Page3Form>({
    defaultValues: page3Data,
  });

  const onSubmit: SubmitHandler<Page3Form> = async (data) => {
    dispatch(updatePage3(data));
    await submitForm(formData); // Submit all form data
    onSubmitFinal();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Address:</label>
        <input {...register('address')} />
      </div>
      <div>
        <label>City:</label>
        <input {...register('city')} />
      </div>
      <button type="button" onClick={onBack}>Back</button>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default Page3;
