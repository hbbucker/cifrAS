# Templates de E-mail do Supabase para o CifrAS

Estes templates foram desenhados para serem copiados e colados diretamente no painel do Supabase, em **Authentication > Email Templates**.

Eles seguem o Design System da aplicação, utilizando o roxo primário (`#aa3bff`) e um fundo agradável off-white (`#fbfbf9`), com cantos arredondados e tipografia limpa.

---

## 1. Reset Password (Redefinição de Senha)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Redefinição de Senha - CifrAS</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbf9; color: #33332e; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #aa3bff; padding: 32px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px; }
        .content h2 { color: #000000; font-size: 22px; margin-top: 0; margin-bottom: 16px; }
        .content p { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #33332e; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background-color: #aa3bff; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 600; font-size: 16px; }
        .footer { background-color: #f6f6f3; padding: 24px 40px; text-align: center; font-size: 14px; color: #666666; }
        .footer p { margin: 0 0 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CifrAS</h1>
        </div>
        <div class="content">
            <h2>Olá! 👋</h2>
            <p>Recebemos um pedido para redefinir a senha da sua conta no CifrAS. Se foi você, basta clicar no botão abaixo para criar uma nova senha e voltar a tocar suas músicas.</p>
            
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="button">Redefinir minha senha</a>
            </div>
            
            <p>Se você não fez essa solicitação, pode ignorar este e-mail com segurança. Sua conta continua protegida.</p>
        </div>
        <div class="footer">
            <p><strong>CifrAS</strong> — Suas músicas organizadas para o próximo show.</p>
        </div>
    </div>
</body>
</html>
```

---

## 2. Confirm Signup (Confirmação de Cadastro)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Bem-vindo ao CifrAS!</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbf9; color: #33332e; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #aa3bff; padding: 32px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px; }
        .content h2 { color: #000000; font-size: 22px; margin-top: 0; margin-bottom: 16px; }
        .content p { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #33332e; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background-color: #aa3bff; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 600; font-size: 16px; }
        .footer { background-color: #f6f6f3; padding: 24px 40px; text-align: center; font-size: 14px; color: #666666; }
        .footer p { margin: 0 0 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CifrAS</h1>
        </div>
        <div class="content">
            <h2>Bem-vindo(a) ao CifrAS! 🎶</h2>
            <p>Estamos muito felizes em ter você com a gente. Para começar a organizar e transpor suas cifras em segundos, precisamos apenas que você confirme seu endereço de e-mail.</p>
            
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="button">Confirmar meu e-mail</a>
            </div>
            
            <p>Seja preparando o setlist do próximo show ou apenas praticando em casa, o CifrAS foi feito para facilitar a sua vida no palco.</p>
        </div>
        <div class="footer">
            <p><strong>CifrAS</strong> — Suas músicas organizadas para o próximo show.</p>
        </div>
    </div>
</body>
</html>
```

---

## 3. Magic Link (Login sem senha)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Seu link de acesso ao CifrAS</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbf9; color: #33332e; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #aa3bff; padding: 32px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px; }
        .content h2 { color: #000000; font-size: 22px; margin-top: 0; margin-bottom: 16px; }
        .content p { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #33332e; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { display: inline-block; background-color: #aa3bff; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 600; font-size: 16px; }
        .footer { background-color: #f6f6f3; padding: 24px 40px; text-align: center; font-size: 14px; color: #666666; }
        .footer p { margin: 0 0 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CifrAS</h1>
        </div>
        <div class="content">
            <h2>Pronto para tocar? 🎸</h2>
            <p>Você solicitou um link mágico para acessar sua conta no CifrAS. Clique no botão abaixo para entrar instantaneamente, sem precisar digitar senha.</p>
            
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="button">Entrar no CifrAS</a>
            </div>
            
            <p>Este link é seguro e válido apenas por alguns minutos. Se você não solicitou este acesso, sinta-se à vontade para ignorar este e-mail.</p>
        </div>
        <div class="footer">
            <p><strong>CifrAS</strong> — Suas músicas organizadas para o próximo show.</p>
        </div>
    </div>
</body>
</html>
```
