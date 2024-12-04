import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useUpdateFormMutation } from "../Redux/formApi";
import { useAppDispatch, useAppSelector } from "../Redux/hooks";
import { updatePage1 } from "../Redux/formSlice";

interface Page1Form {
  name: string;
  email: string;
}

const Page1: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const dispatch = useAppDispatch();
  const page1Data = useAppSelector((state) => state.form.page1);
  const [updateForm] = useUpdateFormMutation();
  const { register, handleSubmit, watch, reset } = useForm<Page1Form>({
    defaultValues: page1Data,
  });

  const [showEmail, setShowEmail] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const watchedName = watch("name");
  const watchedEmail = watch("email");

  // Sync form with Redux state
  useEffect(() => {
    reset(page1Data);
  }, [page1Data, reset]);

  // Reveal the email field when the name field is filled
  useEffect(() => {
    setShowEmail(!!watchedName);
  }, [watchedName]);

  // Reveal the Next button when the email field is filled
  useEffect(() => {
    setShowNextButton(!!watchedEmail && !!watchedName);
  }, [watchedEmail, watchedName]);

  const onSubmit: SubmitHandler<Page1Form> = async (data) => {
    dispatch(updatePage1(data));
    await updateForm({ page1: data }); // Partial update
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Name:</label>
        <input {...register("name")} placeholder="Enter your name" />
      </div>
      {showEmail && (
        <div>
          <label>Email:</label>
          <input
            type="email"
            {...register("email")}
            placeholder="Enter your email"
          />
        </div>
      )}
      {showNextButton && <button type="submit">Next</button>}
    </form>
  );
};

export default Page1;
