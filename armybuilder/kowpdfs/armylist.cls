\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{armylist}

%% Load base
\LoadClass{article}

%% Load packages
\RequirePackage{parskip}
\RequirePackage{titlesec} % For customising section headers
\RequirePackage{arev} % Other font (not as "latex")
\RequirePackage{float} % For fixing stat tables
\RequirePackage{color} % For defining colors
\RequirePackage{colortbl} % For coloring tables
\RequirePackage{array}
\RequirePackage{multirow} % Multirows in tables

%% Margins - See Latex: Page Layout for explanations
%\usepackage{showframe}  % Uncomment to show frames
%paperwidth = 597pt
\topmargin=-1.0cm
\headheight=0pt
\headsep=0pt
\evensidemargin=-1in
\oddsidemargin=-1in
\textwidth=\paperwidth
\textheight=0.88\paperheight
\linespread{1.2} % Line spacing

%% Various definitions
\definecolor{Gray1}{gray}{0.90}
\definecolor{Gray2}{gray}{0.82}

\newcolumntype{g}{>{\centering\columncolor{Gray1}}m{20pt}}
\newcolumntype{h}{>{\centering\columncolor{Gray2}}m{20pt}}
\newcolumntype{a}{>{\centering\columncolor{Gray1}}m{30pt}}
\newcolumntype{n}{>{\centering\columncolor{Gray2}}m{32pt}}

\newcolumntype{Q}{>{\centering\hspace{0pt}}m{40pt}} % Identity icon
\newcolumntype{W}{>{\centering\hspace{0pt}\columncolor{Gray1}}m{30pt}} % Points
\newcolumntype{E}{>{\raggedright\hspace{0pt}}m{150pt}} % Name
\newcolumntype{R}{>{\centering\hspace{0pt}\columncolor{Gray1}}m{142pt}} % Stats
\newcolumntype{T}{>{\raggedright\hspace{0pt}\itshape}m{85pt}} % Special rules
\newcolumntype{Y}{>{\centering\hspace{0pt}\columncolor{Gray1}}m{30pt}} % Power
\newcolumntype{U}{>{\raggedright\hspace{0pt}}m{60pt}} % Ranged attacks
\newcolumntype{x}{>{\centering\hspace{0pt}}m{6pt}} % Spacing cell
% total table width = 569pt

\newcolumntype{L}{>{\raggedright\hspace{0pt}}m{6cm}}
\newcolumntype{S}{>{\centering\hspace{0pt}}m{6cm}}
\newcolumntype{P}{>{\centering\hspace{0pt}}m{1cm}}


%% Title functions
\newcommand{\armytype}[1]{
    \newcommand{\cparmytype}{#1}
}
\newcommand{\pointslimit}[1]{
    \newcommand{\cppointslimit}{#1 points}
}

%% Title Definition
\def\maketitle{
    \begin{minipage}{0.45\textwidth}
        \begin{flushleft}
        \Large
            %\hspace{2cm}
        \@title \\
        \large
            %\hspace{2cm}
        \@author
        \end{flushleft}
    \end{minipage}
    \hfill
    \begin{minipage}{0.45\textwidth}
        \begin{flushright}
        \large
        \cparmytype \\
        \cppointslimit
        \end{flushright}
    \end{minipage}
    \vspace{1.2cm}
}

%% Army list environment
\newenvironment{army}
{
    \begin{table}[H]
}{
    \end{table}
}


%% Unit entry environment
\newenvironment{unit}
{
    \ignorespaces
    %% Define values
    \newcommand{\name}[1]{
        \newcommand{\cpName}{##1}
    }
    \newcommand{\points}[1]{
        \newcommand{\cpPoints}{##1}
    }
    \newcommand{\stats}[6]{
        \newcommand{\statSp}{##1}
        \newcommand{\statMe}{##2}
        \newcommand{\statRa}{##3}
        \newcommand{\statDe}{##4}
        \newcommand{\statAtt}{##5}
        \newcommand{\statNe}{##6}
    }
}{
    \ignorespacesafterend
    \normalsize
    \begin{tabular}{|L|S|P|}
        \hline
        \cpName &
        \begin{tabular}{ghghan}
            \footnotesize Sp &
            \footnotesize Me &
            \footnotesize Ra &
            \footnotesize De &
            \footnotesize Att &
            \footnotesize Ne \tabularnewline \hline
            \statSp & \statMe & \statRa & \statDe & \statAtt & \statNe
        \end{tabular}
        & \cpPoints \tabularnewline \hline
    \end{tabular}
}

\endinput
