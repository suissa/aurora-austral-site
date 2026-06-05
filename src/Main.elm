module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (Html, a, article, aside, br, button, code, div, footer, h1, h2, h3, h4, header, img, li, main_, nav, ol, p, pre, section, span, strong, text, ul)
import Html.Attributes exposing (alt, class, href, id, rel, src, target, title)
import Url exposing (Url)


type alias Model =
    { key : Nav.Key
    , url : Url
    }


type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url


main : Program () Model Msg
main =
    Browser.application
        { init = \_ url key -> ( { key = key, url = url }, Cmd.none )
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
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


view : Model -> Browser.Document Msg
view model =
    { title = pageTitle model.url.path
    , body =
        [ div []
            [ loadingScreen
            , navbar model.url.path
            , routeView model.url.path
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


routeView : String -> Html Msg
routeView path =
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
            shell dashboardPage

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


dashboardPage : Html Msg
dashboardPage =
    div []
        [ pageHeader "Dashboard" "The development dashboard route remains available in Elm. The save-post and upload-media Vite middleware was kept in vite.config.ts." 
        , div [ class "rounded-2xl border border-austral-border bg-austral-surface p-6" ]
            [ h3 [ class "text-xl font-bold text-white mb-3" ] [ text "Migration note" ]
            , p [ class "text-austral-text-muted" ] [ text "Interactive authoring features can be rebuilt with Elm forms and ports while preserving the existing local API endpoints." ]
            ]
        ]


pageHeader : String -> String -> Html Msg
pageHeader titleText subtitle =
    header [ class "rounded-3xl border border-austral-border bg-austral-surface/70 p-8 md:p-10" ]
        [ h1 [ class "text-4xl md:text-5xl font-heading font-extrabold text-white mb-4" ] [ text titleText ]
        , p [ class "max-w-3xl text-austral-text-muted text-lg leading-8" ] [ text subtitle ]
        ]
