<%@ page contentType="text/html;charset=UTF-8"%>
<%@ page import="java.util.*"%>
<%@ page import="gae.Dictionary"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<title>登録一覧</title>
<link rel="stylesheet" href="css/sample.css" type="text/css" />
<script type="text/javascript" src="../html5jp/deco/table.js"></script>
</head>
<%
	List<Dictionary> dictionaries = (List<Dictionary>) request.getAttribute("dictionaries");
%>
<body>
<center>

<h2>一覧表示</h2>
<div class="tbl_center">
<div style="width: 750; text-align: left; margin: auto;">
	<a href="/">トップページへ</a>
</div>
<table class="sample-tbl html5jp-tbldeco" style="font-size: 0.8em; text-align: center;">
	<thead>
		<tr>
			<th style="width: 150px;">単語</th>
			<th style="width: 300px;">訳</th>
			<th style="width: 150px;">更新者</th>
			<th style="width: 150px;">更新日時</th>
		</tr>
	</thead>
	<tbody>
<%
	for (Dictionary dict : dictionaries) {
%>
		<tr>
			<td><%= dict.getWord() %></td>
			<td><%= dict.getTranslation() %></td>
			<td><%= dict.getPerson() %></td>
			<td><%= dict.getUpdateTime() %></td>
		</tr>
		<%
			}
		%>
	</tbody>
</table>
</div>
</body>
</center>
</html>
