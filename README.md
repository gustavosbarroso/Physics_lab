# Physics_lab

Adaptação de algumas simulações originalmente desenvolvidas em Python, construídas para funcionar como laboratórios virtuais interativos de Física para professores e estudantes.

🌐 **Laboratório Virtual de Física:**  
https://gustavosbarroso.github.io/Physics_lab/

---

## 📦 SISTEMAS IMPLEMENTADOS

### I. PÊNDULO AMORTECIDO E PÊNDULO SIMPLES
<img width="1206" height="575" alt="image" src="https://github.com/user-attachments/assets/4596c665-60ac-4bb8-a5ae-cf09f63878a9" />

Link da simulação: https://gustavosbarroso.github.io/Physics_lab/Pendulo/

Pêndulo simples não linear:

$$
\theta'' + \frac{g}{L}\sin(\theta) = 0
$$

---

### II. PÊNDULO DUPLO — SISTEMA CAÓTICO
<img width="1187" height="517" alt="image" src="https://github.com/user-attachments/assets/d10cacf2-f62b-4c05-b5cc-98700e1a436e" />

Link da simulação:https://gustavosbarroso.github.io/Physics_lab/DoublePendulum/


O pêndulo duplo é um sistema não linear acoplado que apresenta comportamento caótico e forte dependência das condições iniciais.

$$
\theta_1'' =
\frac{
-g(2m_1+m_2)\sin(\theta_1)
-m_2g\sin(\theta_1-2\theta_2)
-2m_2\sin(\theta_1-\theta_2)
\left[
\theta_2'^2L_2+
\theta_1'^2L_1\cos(\theta_1-\theta_2)
\right]
}{
L_1
\left[
2m_1+m_2-m_2\cos(2\theta_1-2\theta_2)
\right]
}
$$

$$
\theta_2'' =
\frac{
2\sin(\theta_1-\theta_2)
\left[
\theta_1'^2L_1(m_1+m_2)
+g(m_1+m_2)\cos(\theta_1)
+\theta_2'^2L_2m_2\cos(\theta_1-\theta_2)
\right]
}{
L_2
\left[
2m_1+m_2-m_2\cos(2\theta_1-2\theta_2)
\right]
}
$$


---

### III. INTERFERÊNCIA DE ONDAS EM UMA CADEIA DE MASSAS E MOLAS
<img width="1310" height="451" alt="image" src="https://github.com/user-attachments/assets/f1cebb7c-ee9b-478a-b6e4-bb4b27ef6f58" />

Link da simulação: https://gustavosbarroso.github.io/Physics_lab/MassChainInterference/

Simulação da propagação e interferência de ondas utilizando perturbações gaussianas em uma cadeia de massas e molas acopladas.

---

### IV. SIMULAÇÃO DE CIRCUITO RLC
<img width="1205" height="537" alt="image" src="https://github.com/user-attachments/assets/c919ad96-9005-496c-bd54-ff04bdabb18f" />

Link da simulação: https://gustavosbarroso.github.io/Physics_lab/RLC/

Circuito RLC submetido a uma tensão externa:

$$
V(t)=V_0\cos(\omega t)
$$

$$
q'(t)=i
$$

$$
i'(t)=
\frac{V_0}{L}\cos(\omega t)
-\frac{R}{L}i
-\frac{1}{LC}q
$$

---

### V. CIRCUITO RC
<img width="930" height="479" alt="image" src="https://github.com/user-attachments/assets/4952861d-92a8-4c57-8dfd-6a7b202f6b4e" />

Link da simulação:https://gustavosbarroso.github.io/Physics_lab/RC/

Comportamento de carga e descarga de um capacitor em um circuito RC:

$$
q' + \frac{1}{RC}q = 0
$$

---

### VI. PÊNDULO DE KAPITZA
<img width="746" height="591" alt="image" src="https://github.com/user-attachments/assets/8ed96d43-7a60-4898-8795-297ef6d11896" />
Link: https://gustavosbarroso.github.io/Physics_lab/KapitizaPendulum/

Pêndulo com ponto de suspensão oscilando verticalmente:

$$
y(t)=A\cos(\omega t)
$$

$$
L\theta'' =
-g\sin(\theta)
+A\omega^2\cos(\omega t)\sin(\theta)
$$

---

### VII. PÊNDULO FORÇADO EM UM CARRINHO OSCILANTE
<img width="873" height="577" alt="image" src="https://github.com/user-attachments/assets/d086869d-b114-4ba7-8cb8-1eee50877f2d" />

Link da simulação:https://gustavosbarroso.github.io/Physics_lab/InvertedPendulum/

Pêndulo com ponto de suspensão oscilando horizontalmente:

$$
x(t)=A\cos(\omega t)
$$

$$
\theta'' =
-\frac{g}{L}\sin(\theta)
+\frac{A}{L}\cos(\theta)\cos(\omega t)
$$

---

## 🧮 MÉTODOS NUMÉRICOS

As simulações são baseadas na solução numérica de equações diferenciais ordinárias.

As implementações originais foram desenvolvidas em Python, utilizando métodos de integração numérica, como o método de Runge-Kutta de quarta ordem (RK4).

As adaptações para a web estão sendo desenvolvidas utilizando HTML, CSS e JavaScript.

---

## 🌐 LABORATÓRIO VIRTUAL DE FÍSICA

As simulações interativas estão disponíveis no site do projeto:

**[Abrir Physics_lab](https://gustavosbarroso.github.io/Physics_lab/)**

---

## 📄 LICENÇA

MIT License

Copyright (c) 2026 Gustavo Sobreira Barroso

É concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia
deste software e dos arquivos de documentação associados ao "Software",
a permissão para lidar com o Software sem restrições, incluindo, sem
limitação, os direitos de usar, copiar, modificar, mesclar, publicar,
distribuir, sublicenciar e/ou vender cópias do Software, bem como permitir
que as pessoas às quais o Software é fornecido façam o mesmo, sujeitas às
seguintes condições:

O aviso de copyright acima e este aviso de permissão devem ser incluídos
em todas as cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIAS DE QUALQUER TIPO,
EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS
DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM DETERMINADO FIM E NÃO VIOLAÇÃO.
EM NENHUMA CIRCUNSTÂNCIA OS AUTORES OU DETENTORES DOS DIREITOS AUTORAIS
SERÃO RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO, DANO OU OUTRA
RESPONSABILIDADE, SEJA EM UMA AÇÃO DE CONTRATO, ATO ILÍCITO OU OUTRA
AÇÃO, DECORRENTE DE, OU RELACIONADA AO SOFTWARE OU AO USO OU OUTRAS
NEGOCIAÇÕES COM O SOFTWARE.
