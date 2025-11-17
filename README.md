# 🐾 VeTech Mobile

> Aplicativo mobile para gestão veterinária inteligente - Conectando tutores, pets e clínicas veterinárias.

[![React Native](https://img.shields.io/badge/React%20Native-0.76-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📱 Sobre o Projeto

VeTech Mobile é um aplicativo completo para gestão de clínicas veterinárias, permitindo que tutores de animais acompanhem a saúde dos seus pets, agendem consultas, gerenciem dietas personalizadas e muito mais - tudo em um único lugar.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação Segura** - Login com JWT via Supabase
- 🐕 **Gestão de Pets** - Cadastre e gerencie informações dos seus animais
- 📅 **Agendamento de Consultas** - Marque consultas veterinárias facilmente
- 📋 **Histórico de Saúde** - Acompanhe todo o histórico médico do seu pet
- 🤖 **Dieta com IA** - Sugestões personalizadas de alimentação com inteligência artificial
- 👤 **Perfil do Usuário** - Gerencie seus dados pessoais
- 🏥 **Consultas** - Visualize consultas agendadas e realizadas

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- **[React Native](https://reactnative.dev/)** - Framework para desenvolvimento mobile
- **[Expo](https://expo.dev/)** - Plataforma para desenvolvimento React Native
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - Sistema de navegação baseado em arquivos
- **[Axios](https://axios-http.com/)** - Cliente HTTP para requisições à API
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Armazenamento local persistente
- **[Supabase](https://supabase.com/)** - Backend como serviço para autenticação

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (para emulador Android) ou [Xcode](https://developer.apple.com/xcode/) (para iOS)

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/RaulMigliari/vetech-mobile.git
   cd vetech-mobile
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto (se necessário) e configure as URLs da API:
   ```env
   API_BASE_URL=http://seu-backend-url:8000
   ```

4. **Inicie o projeto**
   ```bash
   npx expo start
   ```

## 📱 Executando o App

### No Android Emulator
```bash
npx expo start --android
```

### No iOS Simulator (apenas macOS)
```bash
npx expo start --ios
```

### No Expo Go (dispositivo físico)
1. Instale o [Expo Go](https://expo.dev/go) no seu dispositivo
2. Execute `npx expo start`
3. Escaneie o QR Code com o aplicativo Expo Go

## 🏗️ Estrutura do Projeto

```
vetech-mobile/
├── app/                      # Páginas e navegação (Expo Router)
│   ├── (tabs)/              # Navegação em abas
│   │   ├── index.tsx        # Tela inicial/Dashboard
│   │   ├── agendamento.tsx  # Agendamento de consultas
│   │   ├── consultas.tsx    # Lista de consultas
│   │   ├── pets.tsx         # Gestão de pets
│   │   ├── historico.tsx    # Histórico de saúde
│   │   ├── dieta.tsx        # Dietas com IA
│   │   └── perfil.tsx       # Perfil do usuário
│   ├── _layout.tsx          # Layout raiz
│   └── login.tsx            # Tela de login
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── ui/              # Componentes de interface
│   ├── constants/           # Constantes (cores, temas)
│   ├── contexts/            # Contextos React (Auth, etc)
│   ├── services/            # Serviços de API
│   │   ├── api.ts           # Cliente Axios configurado
│   │   ├── authService.ts   # Autenticação
│   │   ├── petService.ts    # Gestão de pets
│   │   ├── consultationService.ts
│   │   ├── healthService.ts
│   │   ├── dietService.ts
│   │   └── profileService.ts
│   └── utils/               # Utilitários
├── assets/                  # Imagens e recursos estáticos
└── package.json

```

## 🎨 Funcionalidades Detalhadas

### 📊 Dashboard (Início)
- Visualização rápida de pets cadastrados
- Próximas consultas agendadas
- Última visita ao veterinário
- Ações rápidas para funcionalidades principais

### 🐕 Gestão de Pets
- Cadastro completo de animais (nome, espécie, raça, idade, peso)
- Edição e remoção de pets
- Visualização de informações detalhadas

### 📅 Agendamento
- Seleção de pet
- Escolha de data e horário
- Tipo de consulta
- Notas adicionais

### 🏥 Consultas
- Lista de consultas futuras
- Histórico de consultas realizadas
- Detalhes de cada atendimento

### 📋 Histórico de Saúde
- Timeline completa de eventos médicos
- Vacinas e medicamentos
- Gráfico de evolução de peso
- Dietas aplicadas

### 🤖 Dieta com IA
- Criação de dietas personalizadas usando IA
- Considerações de peso, idade e atividade
- Objetivos (emagrecimento, ganho de peso, manutenção)
- Tipos de alimentação (ração, caseira, mista)

### 👤 Perfil
- Edição de dados pessoais
- Informações de contato
- Logout

## 🔐 Autenticação

O app utiliza autenticação JWT via Supabase. O token é armazenado localmente usando AsyncStorage e incluído em todas as requisições à API através de um interceptor Axios.

### Configuração de Rede

- **Emulador Android**: Usa `10.0.2.2:8000` (IP especial do Android)
- **Dispositivo Físico**: Configure o IP da sua máquina na rede local

## 🧪 Testes

```bash
npm test
```

## 📦 Build

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Requisitos Funcionais Implementados

- [x] **RF-001**: Sistema de Login
- [x] **RF-002**: Gestão de Perfil
- [x] **RF-003**: CRUD de Pets
- [x] **RF-004**: Histórico de Saúde Completo
- [x] **RF-005**: Dietas Personalizadas com IA
- [x] **RF-006**: Visualização de Consultas
- [x] **RF-007**: Agendamento de Consultas
- [ ] **RF-008**: Notificações Push (em desenvolvimento)

## 👨‍💻 Autor

**Raul Migliari**

- GitHub: [@RaulMigliari](https://github.com/RaulMigliari)
- LinkedIn: [Raul Migliari](https://linkedin.com/in/raul-migliari)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Equipe Expo por fornecer ferramentas incríveis
- Comunidade React Native
- Supabase pela excelente infraestrutura de autenticação

---

⭐ Se este projeto te ajudou, considere dar uma estrela!

**Desenvolvido com ❤️ e ☕**
