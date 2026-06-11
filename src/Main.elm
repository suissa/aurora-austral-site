port module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (Html, a, article, aside, br, button, code, div, footer, h1, h2, h3, h4, header, img, label, li, main_, nav, ol, p, pre, section, span, strong, text, textarea, ul)
import Html.Attributes exposing (alt, class, href, id, placeholder, rel, rows, src, style, target, title, value)
import Html.Events exposing (onClick, onDoubleClick, onInput)
import Json.Decode as Decode
import Json.Encode as Encode
import Url exposing (Url)


type alias Model =
    { key : Nav.Key
    , url : Url
    , agents : List AgentPanel
    , modalAgent : Maybe String
    , commandText : String
    , socketStatus : String
    }


type alias AgentPanel =
    { id : String
    , name : String
    , role : String
    , runtime : String
    , host : String
    , status : String
    , severity : String
    , eventType : String
    , eventMsg : String
    , traceId : String
    , taskId : String
    , stepId : String
    , updatedAt : String
    , progressPercent : Maybe Float
    , durationMs : Maybe Float
    , memoryMb : Maybe Float
    , tokensIn : Maybe Float
    , tokensOut : Maybe Float
    , cost : Maybe Float
    , commands : List String
    , files : List String
    , message : Maybe String
    , samples : List Float
    }


type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url
    | AgentEvent Decode.Value
    | OpenCommand String
    | CloseCommand
    | UpdateCommand String
    | ClearCommand
    | SendCommand
    | DismissAgentMessage String


port agentEventReceived : (Decode.Value -> msg) -> Sub msg


port sendAgentCommand : Encode.Value -> Cmd msg


main : Program () Model Msg
main =
    Browser.application
        { init = \_ url key -> ( { key = key, url = url, agents = [], modalAgent = Nothing, commandText = "", socketStatus = "Conectando websocket" }, Cmd.none )
        , view = view
        , update = update
        , subscriptions = \_ -> agentEventReceived AgentEvent
        , onUrlRequest = LinkClicked
        , onUrlChange = UrlChanged
        }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LinkClicked urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.key (Url.toString url) )

                Browser.External externalUrl ->
                    ( model, Nav.load externalUrl )

        UrlChanged url ->
            ( { model | url = url }, Cmd.none )

        AgentEvent payload ->
            case Decode.decodeValue agentEventDecoder payload of
                Ok incoming ->
                    ( { model | agents = upsertAgent incoming model.agents, socketStatus = "Tempo real ativo" }, Cmd.none )

                Err _ ->
                    ( { model | socketStatus = "Evento inválido ignorado" }, Cmd.none )

        OpenCommand agentId ->
            ( { model | modalAgent = Just agentId, commandText = "" }, Cmd.none )

        CloseCommand ->
            ( { model | modalAgent = Nothing, commandText = "" }, Cmd.none )

        UpdateCommand prompt ->
            ( { model | commandText = prompt }, Cmd.none )

        ClearCommand ->
            ( { model | commandText = "" }, Cmd.none )

        SendCommand ->
            case model.modalAgent of
                Just agentId ->
                    ( { model | modalAgent = Nothing, commandText = "" }
                    , sendAgentCommand (Encode.object [ ( "prompt", Encode.string model.commandText ), ( "agent_id", Encode.string agentId ) ])
                    )

                Nothing ->
                    ( model, Cmd.none )

        DismissAgentMessage agentId ->
            ( { model | agents = List.map (clearAgentMessage agentId) model.agents }, Cmd.none )


view : Model -> Browser.Document Msg
view model =
    { title = pageTitle model.url.path
    , body =
        [ div []
            [ loadingScreen
            , navbar model.url.path
            , routeView model model.url.path
            ]
        ]
    }


pageTitle : String -> String
pageTitle path =
    case path of
        "/blog" ->
            "Austral Blog"

        "/vault" ->
            "Aurora Vault"

        "/projects" ->
            "Austral Projects"

        "/examples" ->
            "Austral Examples"

        "/dashboard" ->
            "Austral Dashboard"

        _ ->
            "Austral Language"


routeView : Model -> String -> Html Msg
routeView model path =
    case path of
        "/blog" ->
            shell blogPage

        "/vault" ->
            shell vaultPage

        "/projects" ->
            shell projectsPage

        "/examples" ->
            shell examplesPage

        "/dashboard" ->
            shell (dashboardPage model)

        "/docs" ->
            docsPage

        _ ->
            if String.startsWith "/blog/" path then
                shell blogDetailPage

            else if String.startsWith "/vault/" path then
                shell packageDetailPage

            else
                docsPage


loadingScreen : Html Msg
loadingScreen =
    div [ class "loading-screen loaded" ]
        [ div [ class "text-center" ]
            [ div [ class "loader-ring mx-auto mb-4" ] []
            , p [ class "text-austral-text-muted text-sm font-mono animate-pulse" ] [ text "Loading Austral..." ]
            ]
        ]


navbar : String -> Html Msg
navbar path =
    nav [ class "fixed top-0 left-0 right-0 z-50 bg-austral-bg/90 backdrop-blur-xl border-b border-austral-border shadow-lg shadow-black/20" ]
        [ div [ class "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ]
            [ div [ class "flex items-center justify-between h-20" ]
                [ a [ href "/", class "flex items-center gap-3 group" ]
                    [ img [ src "/icon.png", alt "Austral Icon", class "h-10 w-auto transition-transform duration-500 group-hover:rotate-[360deg]" ] []
                    , span [ class "text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" ] [ text "Austral" ]
                    ]
                , div [ class "hidden md:flex items-center gap-6" ]
                    [ navLink path "/projects" "▣" "Projects" "text-austral-primary"
                    , navLink path "/blog" "◇" "Blog" "text-austral-pink"
                    , navLink path "/docs" "◈" "Docs" "text-austral-primary"
                    , navLink path "/examples" "⌁" "Examples" "text-austral-primary"
                    , div [ class "w-px h-4 bg-austral-border mx-2" ] []
                    , a [ href "https://aurora.austral.codes", target "_blank", rel "noopener noreferrer", class "flex items-center gap-2 px-4 py-1.5 rounded-full bg-austral-primary text-austral-bg text-sm font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(60,216,228,0.2)]" ]
                        [ span [] [ text "◫" ], text "Aurora" ]
                    ]
                , a [ href "/docs", class "md:hidden text-austral-primary font-bold" ] [ text "Menu" ]
                ]
            ]
        ]


navLink : String -> String -> String -> String -> String -> Html Msg
navLink current targetPath icon label activeColor =
    let
        isActive =
            (targetPath == "/docs" && (current == "/" || current == "/docs")) || String.startsWith targetPath current

        colorClass =
            if isActive then
                activeColor

            else
                "text-austral-text-muted hover:text-white"
    in
    a [ href targetPath, class ("flex items-center gap-2 text-sm font-semibold transition-all " ++ colorClass) ]
        [ span [] [ text icon ], text label ]


docsPage : Html Msg
docsPage =
    main_ [ class "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 flex gap-8" ]
        [ sidebar
        , specContent
        ]


sidebar : Html Msg
sidebar =
    aside [ class "hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-auto py-8" ]
        [ div [ class "text-xs uppercase tracking-[0.3em] text-austral-primary mb-4 font-bold" ] [ text "Specification" ]
        , ul [ class "space-y-1" ] (List.map tocItem toc)
        ]


tocItem : ( String, String ) -> Html Msg
tocItem ( anchor, label ) =
    li [] [ a [ href ("#" ++ anchor), class "toc-item block" ] [ text label ] ]


toc : List ( String, String )
toc =
    [ ( "intro", "Introduction" )
    , ( "goals", "Design Goals" )
    , ( "rationale", "Rationale" )
    , ( "syntax", "Syntax" )
    , ( "modules", "Module System" )
    , ( "types", "Type System" )
    , ( "linear-types", "Linear Types" )
    , ( "declarations", "Declarations" )
    , ( "statements", "Statements" )
    , ( "linearity", "Linearity Checking" )
    , ( "stdlib", "Standard Library" )
    , ( "ffi", "Foreign Interfaces" )
    , ( "style", "Style Guide" )
    ]


specContent : Html Msg
specContent =
    article [ class "min-w-0 flex-1 py-12 space-y-20" ]
        [ hero
        , docSection "intro" "The Austral Language Specification" [ p [] [ text "Austral is a systems programming language designed around linear types, capability-based security, and explicit resource ownership." ], quote "Programs should make invalid resource states unrepresentable." ]
        , docSection "goals" "Design Goals" [ cards goals ]
        , docSection "rationale" "Rationale" [ p [] [ text "The language favors clarity, strictness and local reasoning over implicit runtime magic." ], p [] [ text "Errors, resources and effects should be visible at their call sites." ] ]
        , docSection "syntax" "Syntax" [ p [] [ text "Austral uses Ada- and Modula-inspired syntax so blocks are explicit and compiler diagnostics can be direct." ], codeBlock "logic.aum" "if condition then\n    for i from 0 to n do\n        doSomething();\n    end for;\nend if;" ]
        , docSection "modules" "Module System" [ p [] [ text "Interfaces (.aui) and bodies (.aum) separate contracts from implementations." ], codeBlock "Hello.aui" "module Hello is\n    function main(): Unit;\nend module." ]
        , docSection "types" "The Type System" [ p [] [ text "Every Austral type belongs to a universe." ], cards universes ]
        , docSection "linear-types" "Linear Types In-Depth" [ p [] [ text "A linear value must be consumed exactly once, preventing leaks, double frees and aliasing bugs by construction." ], codeBlock "linear.aum" "let { handle, path } := file;\n-- file is consumed; handle and path are now owned." ]
        , docSection "declarations" "Declarations" [ p [] [ text "Functions, records, unions and constants are declared with explicit names, types and module boundaries." ] ]
        , docSection "statements" "Statements" [ p [] [ text "Statements are intentionally structured: assignment, conditionals, loops, case analysis and explicit return." ] ]
        , docSection "linearity" "Linearity Checking" [ p [] [ text "The checker tracks ownership moves through destructuring, branching and function calls." ] ]
        , docSection "stdlib" "Standard Library" [ p [] [ text "The standard library is designed around safe wrappers for memory, files and operating-system capabilities." ] ]
        , docSection "ffi" "Foreign Function Interface" [ p [] [ text "Unsafe C handles are imported at the trust boundary and wrapped immediately in safe linear abstractions." ], codeBlock "C_Wrapper.aum" "pragma Foreign_Import(External_Name => \"malloc\");\nfunction c_malloc(size: SizeT): Address[Nat8];\n\nrecord Buffer: Linear is\n    ptr: Address[Nat8];\nend;" ]
        , docSection "style" "Style Guide" [ p [] [ text "Prefer boring clarity: named ends, explicit ownership and small modules with honest interfaces." ] ]
        , footer [ class "mt-24 pt-8 border-t border-austral-border text-center text-sm text-austral-text-muted pb-12" ]
            [ p [ class "mb-2" ] [ text "The Austral Language Specification — Fernando Borretti" ]
            , p [] [ text "Licensed under the GNU Free Documentation License" ]
            ]
        ]


hero : Html Msg
hero =
    header [ class "relative overflow-hidden rounded-3xl border border-austral-border bg-austral-surface/50 p-8 md:p-12" ]
        [ div [ class "absolute inset-0 hero-glow bg-[radial-gradient(circle_at_20%_20%,rgba(60,216,228,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(244,114,182,0.12),transparent_35%)]" ] []
        , div [ class "relative z-10" ]
            [ img [ src "/logo.png", alt "Austral logo", class "hero-logo mb-8" ] []
            , h1 [ class "text-4xl md:text-6xl font-heading font-extrabold text-white tracking-tight mb-6" ] [ text "A systems language for software that must last." ]
            , p [ class "max-w-3xl text-lg text-austral-text-muted leading-8" ] [ text "This Elm-powered version of the site keeps the original Austral documentation, examples and project navigation while replacing the React runtime with a compiled Elm application." ]
            , div [ class "mt-8 flex flex-wrap gap-3" ]
                [ a [ href "#linear-types", class "px-5 py-3 rounded-full bg-austral-primary text-austral-bg font-bold" ] [ text "Explore linear types" ]
                , a [ href "/examples", class "px-5 py-3 rounded-full border border-austral-border text-white hover:border-austral-primary" ] [ text "View examples" ]
                ]
            ]
        ]


docSection : String -> String -> List (Html Msg) -> Html Msg
docSection anchor titleText body =
    section [ id anchor, class "scroll-mt-28 reveal visible" ]
        (h2 [ class "text-3xl md:text-4xl font-heading font-bold text-white mb-6" ] [ text titleText ] :: div [ class "space-y-5 text-austral-text-muted leading-8" ] body :: [])


quote : String -> Html Msg
quote body =
    div [ class "spec-blockquote" ] [ text body ]


type alias Card =
    { title : String, desc : String, accent : String }


goals : List Card
goals =
    [ { title = "Memory Safety", desc = "Own resources explicitly without garbage collection.", accent = "text-austral-primary" }
    , { title = "Security", desc = "Represent authority with capabilities instead of ambient permissions.", accent = "text-austral-pink" }
    , { title = "Predictability", desc = "Avoid invisible control flow, implicit allocation and surprising effects.", accent = "text-austral-primary" }
    ]


universes : List Card
universes =
    [ { title = "Free Universe", desc = "Values that may be copied or discarded freely, such as integers and booleans.", accent = "text-austral-primary" }
    , { title = "Linear Universe", desc = "Exclusive resources that must be consumed exactly once.", accent = "text-austral-pink" }
    ]


cards : List Card -> Html Msg
cards items =
    div [ class "grid md:grid-cols-3 gap-6 my-6" ]
        (List.map cardView items)


cardView : Card -> Html Msg
cardView item =
    div [ class "bg-austral-surface border border-austral-border rounded-xl p-6 hover:border-austral-primary/50 transition" ]
        [ h3 [ class ("font-heading font-bold text-xl mb-2 " ++ item.accent) ] [ text item.title ]
        , p [ class "text-sm text-austral-text-muted" ] [ text item.desc ]
        ]


codeBlock : String -> String -> Html Msg
codeBlock filename sourceCode =
    div [ class "code-ide my-6" ]
        [ div [ class "code-ide-header" ]
            [ div [ class "flex items-center gap-3" ]
                [ div [ class "code-dots" ] [ span [] [], span [] [], span [] [] ]
                , span [ class "text-xs text-austral-text-muted font-mono" ] [ text filename ]
                ]
            , span [ class "text-xs text-austral-primary font-mono" ] [ text "Elm view" ]
            ]
        , pre [] [ code [] [ text sourceCode ] ]
        ]


shell : Html Msg -> Html Msg
shell content =
    main_ [ class "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20" ]
        [ content ]


blogPage : Html Msg
blogPage =
    div []
        [ pageHeader "Austral Blog" "Essays and proposals about linear types, security, resource governance and the Austral language." 
        , div [ class "grid md:grid-cols-2 gap-6 mt-10" ] (List.map articleCard articles)
        ]


blogDetailPage : Html Msg
blogDetailPage =
    div [ class "max-w-3xl mx-auto" ]
        [ pageHeader "Blog article" "The Elm migration keeps the static article catalog available. Markdown rendering can be reintroduced through Elm ports or precompiled content." 
        , codeBlock "vite.elm/converter" "npm run convert:react -- --out converted-elm"
        ]


articleCard : String -> Html Msg
articleCard titleText =
    a [ href "/blog/article", class "block rounded-2xl border border-austral-border bg-austral-surface/70 p-6 hover:border-austral-pink transition" ]
        [ h3 [ class "text-xl font-heading font-bold text-white mb-3" ] [ text titleText ]
        , p [ class "text-austral-text-muted" ] [ text "Read the archived article and continue the discussion around Austral's design." ]
        ]


articles : List String
articles =
    [ "Dawn of Linearity"
    , "The Language for Building Pyramids"
    , "Understanding the Use-Once Rule"
    , "Security Architecture Proposal"
    , "Secure-by-Design PQC"
    , "The Scuttle the Ship Philosophy"
    ]


vaultPage : Html Msg
vaultPage =
    div []
        [ pageHeader "Aurora Vault" "A package index concept for Austral libraries and tools." 
        , cards
            [ { title = "one-llm-4-all", desc = "Provider-rotation utilities for LLM integrations.", accent = "text-austral-primary" }
            , { title = "austral-memory", desc = "Safe memory governance primitives.", accent = "text-austral-pink" }
            , { title = "capability-kit", desc = "Capability-oriented application patterns.", accent = "text-austral-primary" }
            ]
        ]


packageDetailPage : Html Msg
packageDetailPage =
    div []
        [ pageHeader "Package details" "Package detail routes are now served by Elm. Connect live package metadata through Elm flags or generated modules when the registry API is ready." ]


projectsPage : Html Msg
projectsPage =
    div []
        [ pageHeader "Projects" "Reference projects and ecosystem experiments around Austral." 
        , cards
            [ { title = "Austral compiler", desc = "Core compiler and specification work.", accent = "text-austral-primary" }
            , { title = "Aurora package hub", desc = "Registry, vault and publishing workflow.", accent = "text-austral-pink" }
            , { title = "vite.elm", desc = "The new Vite framework plugin and React-to-Elm converter powering this migration.", accent = "text-austral-primary" }
            ]
        ]


examplesPage : Html Msg
examplesPage =
    div []
        [ pageHeader "Examples" "Small Austral programs rendered by Elm components." 
        , div [ class "grid lg:grid-cols-2 gap-6 mt-10" ]
            [ codeBlock "Hello.aui" "module Hello is\n    function main(): Unit;\nend module."
            , codeBlock "Hello.aum" "module body Hello is\n    function main(): Unit is\n        print(\"Hello, world!\");\n        return nil;\n    end;\nend module body."
            , codeBlock "Result.aum" "union Result[T: Free, E: Free]: Free is\n    case Success is\n        value: T;\n    case Failure is\n        error: E;\nend;"
            , codeBlock "Memory.aum" "let ptr: Address[Int32] := allocate(1);\n-- ... use pointer ...\ndeallocate(ptr);"
            ]
        ]


dashboardPage : Model -> Html Msg
dashboardPage model =
    div [ class "space-y-8" ]
        [ pageHeader "Multi-agent Observability" "Dashboard em tempo real: cada novo agent.id recebido pelo WebSocket cria uma seção dinâmica; eventos posteriores atualizam apenas o card daquele agente."
        , componentContract
        , realtimeChart model.agents
        , div [ class "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-austral-border bg-austral-surface/70 p-4" ]
            [ div []
                [ p [ class "text-xs uppercase tracking-[0.25em] text-austral-primary font-bold" ] [ text "WebSocket" ]
                , p [ class "text-white font-semibold" ] [ text model.socketStatus ]
                ]
            , span [ class "text-austral-text-muted text-sm" ] [ text (String.fromInt (List.length model.agents) ++ " agents observados") ]
            ]
        , if List.isEmpty model.agents then
            emptyDashboard

          else
            div [ class "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6" ] (List.map agentSection model.agents)
        , commandModal model
        ]


pageHeader : String -> String -> Html Msg
pageHeader titleText subtitle =
    header [ class "rounded-3xl border border-austral-border bg-austral-surface/70 p-8 md:p-10" ]
        [ h1 [ class "text-4xl md:text-5xl font-heading font-extrabold text-white mb-4" ] [ text titleText ]
        , p [ class "max-w-3xl text-austral-text-muted text-lg leading-8" ] [ text subtitle ]
        ]


componentContract : Html Msg
componentContract =
    let
        item ( componentName, propName ) =
            li [ class "rounded-xl border border-austral-border bg-black/20 p-3" ]
                [ span [ class "text-white font-semibold" ] [ text componentName ]
                , span [ class "text-austral-text-muted" ] [ text (" ← " ++ propName) ]
                ]
    in
    section [ class "rounded-2xl border border-austral-border bg-austral-surface/60 p-5" ]
        [ h2 [ class "text-xl font-heading font-bold text-white mb-2" ] [ text "Componentes declarados" ]
        , p [ class "text-sm text-austral-text-muted mb-4" ] [ text "Nome do componente e propriedade responsável por entregar valor ao componente." ]
        , ul [ class "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm" ]
            (List.map item
                [ ( "AgentGrid", "agents" )
                , ( "AgentSection", "agent" )
                , ( "RealtimeChart", "samples" )
                , ( "MetricTile", "metric" )
                , ( "CommandModal", "agent_id" )
                , ( "MessageOverlay", "agent.message" )
                ]
            )
        ]


emptyDashboard : Html Msg
emptyDashboard =
    div [ class "rounded-3xl border border-dashed border-austral-border bg-austral-surface/40 p-8 text-center" ]
        [ h3 [ class "text-2xl font-heading font-bold text-white mb-3" ] [ text "Aguardando eventos" ]
        , p [ class "text-austral-text-muted" ] [ text "Quando um JSON com agent.id chegar via WebSocket, uma nova section será criada automaticamente." ]
        ]


agentSection : AgentPanel -> Html Msg
agentSection agent =
    section [ class "relative overflow-hidden rounded-3xl border border-austral-border bg-austral-surface/80 p-4 sm:p-5 shadow-xl" ]
        [ div [ class "flex items-start justify-between gap-3 mb-4" ]
            [ div [ class "min-w-0" ]
                [ p [ class "text-xs text-austral-primary font-mono truncate" ] [ text agent.id ]
                , h3 [ class "text-xl font-heading font-bold text-white truncate" ] [ text agent.name ]
                , p [ class "text-sm text-austral-text-muted" ] [ text (agent.role ++ " · " ++ agent.runtime ++ " · " ++ agent.host) ]
                ]
            , button [ onClick (OpenCommand agent.id), class "min-h-12 px-5 rounded-2xl bg-austral-primary text-austral-bg font-extrabold shadow-[0_0_20px_rgba(60,216,228,0.25)] active:scale-95" ] [ text "Comandar" ]
            ]
        , div [ class "flex flex-wrap gap-2 mb-4" ]
            [ statusPill agent.status
            , severityPill agent.severity
            , span [ class "px-3 py-1 rounded-full bg-white/5 text-xs text-austral-text-muted" ] [ text agent.eventType ]
            ]
        , div [ class "rounded-2xl border border-austral-border bg-black/20 p-4 mb-4" ]
            [ p [ class "text-xs uppercase tracking-[0.2em] text-austral-primary mb-2" ] [ text "Último evento" ]
            , p [ class "text-white font-semibold" ] [ text agent.eventMsg ]
            , p [ class "text-xs text-austral-text-muted mt-2" ] [ text ("trace " ++ agent.traceId ++ " · task " ++ agent.taskId ++ " · step " ++ agent.stepId) ]
            ]
        , div [ class "relative" ]
            [ div [ class "grid grid-cols-2 gap-3" ]
                [ metricTile "Progresso" (maybePercent agent.progressPercent)
                , metricTile "Duração" (maybeMs agent.durationMs)
                , metricTile "Memória" (maybeMb agent.memoryMb)
                , metricTile "Tokens" (maybeTokens agent.tokensIn agent.tokensOut)
                , metricTile "Custo" (maybeCost agent.cost)
                , metricTile "Arquivos" (String.fromInt (List.length agent.files))
                ]
            , messageOverlay agent
            ]
        , miniBars agent.samples
        ]


messageOverlay : AgentPanel -> Html Msg
messageOverlay agent =
    case agent.message of
        Just message ->
            div [ onDoubleClick (DismissAgentMessage agent.id), class "absolute inset-0 z-10 flex items-center justify-center rounded-2xl p-4 text-center", style "background-color" "#000", style "color" "#fff", style "font-size" "16px", style "font-weight" "700" ]
                [ text message ]

        Nothing ->
            text ""


metricTile : String -> String -> Html Msg
metricTile labelText valueText =
    div [ class "rounded-2xl border border-austral-border bg-austral-bg/70 p-3" ]
        [ p [ class "text-[11px] uppercase tracking-[0.18em] text-austral-text-muted" ] [ text labelText ]
        , p [ class "text-lg font-bold text-white mt-1" ] [ text valueText ]
        ]


statusPill : String -> Html Msg
statusPill status =
    span [ class ("px-3 py-1 rounded-full text-xs font-bold " ++ statusClass status) ] [ text status ]


severityPill : String -> Html Msg
severityPill severity =
    span [ class ("px-3 py-1 rounded-full text-xs font-bold " ++ severityClass severity) ] [ text severity ]


statusClass : String -> String
statusClass status =
    case status of
        "running" ->
            "bg-austral-primary/15 text-austral-primary"

        "success" ->
            "bg-emerald-400/15 text-emerald-300"

        "failed" ->
            "bg-red-400/15 text-red-300"

        "blocked" ->
            "bg-amber-400/15 text-amber-300"

        "offline" ->
            "bg-slate-400/15 text-slate-300"

        _ ->
            "bg-white/10 text-austral-text-muted"


severityClass : String -> String
severityClass severity =
    case severity of
        "error" ->
            "bg-red-500/15 text-red-300"

        "fatal" ->
            "bg-red-700/25 text-red-200"

        "warn" ->
            "bg-yellow-500/15 text-yellow-200"

        _ ->
            "bg-austral-pink/15 text-austral-pink"


realtimeChart : List AgentPanel -> Html Msg
realtimeChart agents =
    let
        samples =
            agents
                |> List.concatMap .samples
                |> List.take 24
                |> List.reverse

        maxValue =
            samples |> List.maximum |> Maybe.withDefault 1 |> max 1

        bar sample =
            let
                h =
                    String.fromFloat (max 8 ((sample / maxValue) * 100)) ++ "%"
            in
            div [ class "flex-1 rounded-t-lg bg-gradient-to-t from-austral-primary to-austral-pink min-w-2", style "height" h, title (String.fromFloat sample ++ "ms") ] []
    in
    section [ class "rounded-3xl border border-austral-border bg-austral-surface/70 p-5" ]
        [ div [ class "flex items-center justify-between gap-3 mb-4" ]
            [ div []
                [ h2 [ class "text-xl font-heading font-bold text-white" ] [ text "Chart em tempo real" ]
                , p [ class "text-sm text-austral-text-muted" ] [ text "Atualiza a cada evento WebSocket usando metrics.duration_ms." ]
                ]
            , span [ class "text-xs text-austral-primary font-mono" ] [ text (String.fromInt (List.length samples) ++ " samples") ]
            ]
        , div [ class "h-40 flex items-end gap-1 rounded-2xl bg-black/30 border border-austral-border p-3" ]
            (if List.isEmpty samples then
                [ div [ class "w-full text-center text-austral-text-muted text-sm self-center" ] [ text "Sem métricas ainda" ] ]

             else
                List.map bar samples
            )
        ]


miniBars : List Float -> Html Msg
miniBars samples =
    let
        lastSamples =
            samples |> List.take 10 |> List.reverse

        maxValue =
            lastSamples |> List.maximum |> Maybe.withDefault 1 |> max 1

        bar sample =
            div [ class "flex-1 rounded-full bg-austral-primary/70", style "height" (String.fromFloat (max 6 ((sample / maxValue) * 48)) ++ "px") ] []
    in
    div [ class "mt-4 h-14 flex items-end gap-1" ] (List.map bar lastSamples)


commandModal : Model -> Html Msg
commandModal model =
    case model.modalAgent of
        Just agentId ->
            div [ class "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6" ]
                [ div [ class "w-full max-w-xl rounded-3xl border border-austral-border bg-austral-surface p-5 shadow-2xl" ]
                    [ div [ class "flex items-start justify-between gap-4 mb-4" ]
                        [ div []
                            [ h2 [ class "text-2xl font-heading font-bold text-white" ] [ text "Comandar agent" ]
                            , p [ class "text-sm text-austral-text-muted font-mono" ] [ text agentId ]
                            ]
                        , button [ onClick CloseCommand, class "text-austral-text-muted hover:text-white text-2xl px-2" ] [ text "×" ]
                        ]
                    , label [ class "text-sm font-semibold text-austral-primary" ] [ text "Prompt" ]
                    , textarea [ value model.commandText, onInput UpdateCommand, rows 7, placeholder "Digite o comando para o agent...", class "mt-2 w-full rounded-2xl border border-austral-border bg-black/40 p-4 text-white outline-none focus:border-austral-primary" ] []
                    , div [ class "mt-4 grid grid-cols-2 gap-3" ]
                        [ button [ onClick ClearCommand, class "min-h-12 rounded-2xl border border-austral-border text-white font-bold" ] [ text "Limpar" ]
                        , button [ onClick SendCommand, class "min-h-12 rounded-2xl bg-austral-primary text-austral-bg font-extrabold" ] [ text "Enviar" ]
                        ]
                    ]
                ]

        Nothing ->
            text ""


maybePercent : Maybe Float -> String
maybePercent valueMaybe =
    case valueMaybe of
        Just n ->
            String.fromInt (round n) ++ "%"

        Nothing ->
            "—"


maybeMs : Maybe Float -> String
maybeMs valueMaybe =
    case valueMaybe of
        Just n ->
            String.fromInt (round n) ++ "ms"

        Nothing ->
            "—"


maybeMb : Maybe Float -> String
maybeMb valueMaybe =
    case valueMaybe of
        Just n ->
            String.fromInt (round n) ++ "MB"

        Nothing ->
            "—"


maybeCost : Maybe Float -> String
maybeCost valueMaybe =
    case valueMaybe of
        Just n ->
            "$" ++ String.fromFloat n

        Nothing ->
            "—"


maybeTokens : Maybe Float -> Maybe Float -> String
maybeTokens tokensIn tokensOut =
    String.fromInt (round (Maybe.withDefault 0 tokensIn + Maybe.withDefault 0 tokensOut))


agentEventDecoder : Decode.Decoder AgentPanel
agentEventDecoder =
    Decode.map8 buildAgentPanel
        (Decode.field "agent" agentDecoder)
        (Decode.maybe (Decode.field "event" eventDecoder))
        (Decode.maybe (Decode.field "progress" progressDecoder))
        (Decode.maybe (Decode.field "metrics" metricsDecoder))
        (Decode.maybe (Decode.field "io" ioDecoder))
        (Decode.maybe (Decode.field "ts" Decode.string))
        (Decode.maybe (Decode.field "trace_id" Decode.string))
        (Decode.maybe (Decode.field "task_id" Decode.string))
        |> Decode.andThen
            (\partial ->
                Decode.map2 partial
                    (Decode.maybe (Decode.field "step_id" Decode.string))
                    (Decode.maybe (Decode.at [ "agent", "message" ] Decode.string))
            )


type alias AgentCore =
    { id : String, name : String, role : String, runtime : String, host : String }


type alias EventCore =
    { eventType : String, status : String, severity : String, msg : String }


type alias ProgressCore =
    { percent : Maybe Float }


type alias MetricsCore =
    { durationMs : Maybe Float, memoryMb : Maybe Float, tokensIn : Maybe Float, tokensOut : Maybe Float, cost : Maybe Float }


type alias IoCore =
    { files : List String, commands : List String }


agentDecoder : Decode.Decoder AgentCore
agentDecoder =
    Decode.map5 AgentCore
        (Decode.field "id" Decode.string)
        (Decode.maybe (Decode.field "name" Decode.string) |> Decode.map (Maybe.withDefault "Unnamed agent"))
        (Decode.maybe (Decode.field "role" Decode.string) |> Decode.map (Maybe.withDefault "custom"))
        (Decode.maybe (Decode.field "runtime" Decode.string) |> Decode.map (Maybe.withDefault "custom"))
        (Decode.maybe (Decode.field "host" Decode.string) |> Decode.map (Maybe.withDefault "unknown"))


eventDecoder : Decode.Decoder EventCore
eventDecoder =
    Decode.map4 EventCore
        (Decode.maybe (Decode.field "type" Decode.string) |> Decode.map (Maybe.withDefault "agent.message"))
        (Decode.maybe (Decode.field "status" Decode.string) |> Decode.map (Maybe.withDefault "ready"))
        (Decode.maybe (Decode.field "severity" Decode.string) |> Decode.map (Maybe.withDefault "info"))
        (Decode.maybe (Decode.field "msg" Decode.string) |> Decode.map (Maybe.withDefault "Evento recebido"))


progressDecoder : Decode.Decoder ProgressCore
progressDecoder =
    Decode.map ProgressCore (Decode.maybe (Decode.field "percent" Decode.float))


metricsDecoder : Decode.Decoder MetricsCore
metricsDecoder =
    Decode.map5 MetricsCore
        (Decode.maybe (Decode.field "duration_ms" Decode.float))
        (Decode.maybe (Decode.field "memory_mb" Decode.float))
        (Decode.maybe (Decode.field "tokens_in" Decode.float))
        (Decode.maybe (Decode.field "tokens_out" Decode.float))
        (Decode.maybe (Decode.field "cost" Decode.float))


ioDecoder : Decode.Decoder IoCore
ioDecoder =
    Decode.map2 IoCore
        (Decode.maybe (Decode.field "files" (Decode.list Decode.string)) |> Decode.map (Maybe.withDefault []))
        (Decode.maybe (Decode.field "commands" (Decode.list Decode.string)) |> Decode.map (Maybe.withDefault []))


buildAgentPanel : AgentCore -> Maybe EventCore -> Maybe ProgressCore -> Maybe MetricsCore -> Maybe IoCore -> Maybe String -> Maybe String -> Maybe String -> Maybe String -> Maybe String -> AgentPanel
buildAgentPanel agent eventMaybe progressMaybe metricsMaybe ioMaybe ts traceId taskId stepId message =
    let
        event =
            Maybe.withDefault (EventCore "agent.message" "ready" "info" "Mensagem recebida") eventMaybe

        progress =
            Maybe.withDefault (ProgressCore Nothing) progressMaybe

        metrics =
            Maybe.withDefault (MetricsCore Nothing Nothing Nothing Nothing Nothing) metricsMaybe

        io =
            Maybe.withDefault (IoCore [] []) ioMaybe

        sample =
            Maybe.withDefault 0 metrics.durationMs
    in
    { id = agent.id
    , name = agent.name
    , role = agent.role
    , runtime = agent.runtime
    , host = agent.host
    , status = event.status
    , severity = event.severity
    , eventType = event.eventType
    , eventMsg = event.msg
    , traceId = Maybe.withDefault "trc_*" traceId
    , taskId = Maybe.withDefault "tsk_*" taskId
    , stepId = Maybe.withDefault "stp_*" stepId
    , updatedAt = Maybe.withDefault "" ts
    , progressPercent = progress.percent
    , durationMs = metrics.durationMs
    , memoryMb = metrics.memoryMb
    , tokensIn = metrics.tokensIn
    , tokensOut = metrics.tokensOut
    , cost = metrics.cost
    , commands = io.commands
    , files = io.files
    , message = message
    , samples = if sample > 0 then [ sample ] else []
    }


upsertAgent : AgentPanel -> List AgentPanel -> List AgentPanel
upsertAgent incoming agents =
    let
        merge existing =
            if existing.id == incoming.id then
                { incoming | samples = List.take 24 (incoming.samples ++ existing.samples), message = incoming.message |> Maybe.or existing.message }

            else
                existing
    in
    if List.any (\agent -> agent.id == incoming.id) agents then
        List.map merge agents

    else
        incoming :: agents


clearAgentMessage : String -> AgentPanel -> AgentPanel
clearAgentMessage agentId agent =
    if agent.id == agentId then
        { agent | message = Nothing }

    else
        agent
