import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from './SignUp';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, confirmSetPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <BrowserRouter>
      <SignUp
        name={name} setName={setName}
        email={email} setEmail={setEmail}
        phone={phone} setPhone={setPhone}
        password={password} setPassword={setPassword}
        confirmPassword={confirmPassword} confirmSetPassword={confirmSetPassword}
        errors={errors} setErrors={setErrors}
        passwordFocused={passwordFocused} setPasswordFocused={setPasswordFocused}
      />
    </BrowserRouter>
  );
}

export default App;
