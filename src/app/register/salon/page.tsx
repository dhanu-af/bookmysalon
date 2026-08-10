import { RegisterSalonForm } from "./register-salon-form";

export default function RegisterSalonPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">List your salon on BookMySalon</h1>
      <p className="mb-6 text-muted-foreground">
        Your salon will be reviewed by our team before it appears in customer search — usually within 24 hours.
      </p>
      <RegisterSalonForm />
    </div>
  );
}
