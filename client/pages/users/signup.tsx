import Head from "next/head";
import React from "react";

export default function Signup() {
  const signupFormSubmit = async (e) => {
    e.preventDefault()

    const formData = Array.from(new FormData(e.target).entries()).reduce((o, [k, v]) => {
      return o[k] = v, o;
    }, {} as { [key:string]: any })

    const response = await fetch("//aloi:3001/user", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((r) => r.json())

    console.log({ response, formData })
  }

  return (
    <div className="container mx-auto">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-10">
        <div className="flex flex-row">
          <div className="flex-1">
            <form onSubmitCapture={(e) => signupFormSubmit(e)}>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="text" id="email" name="email" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Password:</label>
                <input type="password" id="password" name="password" />
              </div>

              <div className="form-group">
                <input type="submit" value="Signup" className="btn btn-default btn-ghost" />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
