import { Form, FormField, useForm } from '@/components/form';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthenticationLayout from '../../../../layouts/AuthenticationLayout';
import useLoginHandler from '../controller/useLoginHandler';

function LoginWorkflow() {
  const { isLoading, loginHandler } = useLoginHandler();
  const [form] = useForm();

  return (
    <AuthenticationLayout
      Sidebarcontent={
        <>
          Run every Bridged account.{' '}
          <span className="text-primary-foreground/65">From one place.</span>
        </>
      }
    >
      {/* Both fields are needed to log in, so no required markers. */}
      <Form form={form} onFinish={loginHandler} requiredMark={false}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[30px] leading-[1.1] font-bold tracking-[-0.035em] text-balance">
              Welcome back
            </h1>
            <p className="text-[15px] text-pretty text-muted-foreground">
              Log in to manage accounts, teams and credits.
            </p>
          </div>
          <FieldGroup className="gap-5">
            <FormField
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Enter your username.' }]}
            >
              <Input
                autoComplete="username"
                autoFocus
                placeholder="Your username"
                className="h-11"
              />
            </FormField>
            <FormField
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Enter your password.' }]}
            >
              <PasswordInput
                autoComplete="current-password"
                placeholder="Your password"
                className="h-11"
              />
            </FormField>
          </FieldGroup>
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner data-icon="inline-start" />}
            Log in
          </Button>
        </div>
      </Form>
    </AuthenticationLayout>
  );
}

export default LoginWorkflow;
